import pandas as pd
import numpy as np
import json
import os
import math

print("Loading dataset...")
# Load the dataset
# Some rows might have bad formats, we use on_bad_lines='skip' just in case, though pandas usually handles it well.
df = pd.read_csv('DataCoSupplyChainDataset.csv', encoding='latin1')

print(f"Dataset loaded: {len(df)} rows.")

# Data Cleaning & Parsing
print("Parsing dates...")
# order date (DateOrders) format: '1/31/2018 22:56'
df['order date (DateOrders)'] = pd.to_datetime(df['order date (DateOrders)'])
df['Month'] = df['order date (DateOrders)'].dt.strftime('%b') # Jan, Feb, etc.
df['Year'] = df['order date (DateOrders)'].dt.year
df['YearMonth'] = df['order date (DateOrders)'].dt.strftime('%Y-%m') # 2018-01

# Create output directory
output_dir = 'src/data'
os.makedirs(output_dir, exist_ok=True)

# -----------------------------------------
# 1. Overview Aggregation
# -----------------------------------------
print("Aggregating Overview...")
total_revenue = float(df['Sales'].sum())
total_orders = len(df)
total_profit = float(df['Order Profit Per Order'].sum())
avg_profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
fraud_attempts = int((df['Order Status'] == 'SUSPECTED_FRAUD').sum())
late_deliveries = int((df['Late_delivery_risk'] == 1).sum())

# Monthly Trend (aggregate by YearMonth, then we can take the last 12 months or similar, but let's just group by month name for a generic view since this dataset spans multiple years, let's take just the latest year or group by Month generically)
# Dataset mostly covers 2015-2018. Let's group by Month to get a generic annual trend, sorted by month order.
month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
monthly_trend = df.groupby('Month').agg({'Sales': 'sum', 'Order Id': 'count'}).reindex(month_order).fillna(0)
overview_monthly = []
for month in month_order:
    overview_monthly.append({
        'name': month,
        'revenue': float(monthly_trend.loc[month, 'Sales']),
        'orders': int(monthly_trend.loc[month, 'Order Id'])
    })

# Segment Aggregation by Year
segment_sales = df.groupby(['Year', 'Customer Segment'])['Sales'].sum().reset_index()
all_time_segments = df.groupby('Customer Segment')['Sales'].sum().reset_index()

sales_by_year = {}

# All Time
all_time_total = all_time_segments['Sales'].sum()
all_time_seg_list = []
for _, row in all_time_segments.iterrows():
    all_time_seg_list.append({
        'name': row['Customer Segment'],
        'revenue': float(row['Sales']),
        'percentage': float((row['Sales'] / all_time_total) * 100) if all_time_total > 0 else 0
    })
sales_by_year['All Time'] = {
    'totalRevenue': float(all_time_total),
    'segments': all_time_seg_list
}

# By Year
for year in df['Year'].dropna().unique():
    year_df = segment_sales[segment_sales['Year'] == year]
    year_total = year_df['Sales'].sum()
    year_seg_list = []
    for _, row in year_df.iterrows():
        year_seg_list.append({
            'name': row['Customer Segment'],
            'revenue': float(row['Sales']),
            'percentage': float((row['Sales'] / year_total) * 100) if year_total > 0 else 0
        })
    sales_by_year[str(int(year))] = {
        'totalRevenue': float(year_total),
        'segments': year_seg_list
    }

overview_data = {
    'summary': {
        'totalRevenue': total_revenue,
        'totalOrders': total_orders,
        'avgProfitMargin': avg_profit_margin,
        'fraudAttempts': fraud_attempts,
        'lateDeliveries': late_deliveries
    },
    'monthlyTrend': overview_monthly,
    'salesByYear': sales_by_year
}
with open(os.path.join(output_dir, 'overview.json'), 'w') as f:
    json.dump(overview_data, f, indent=2)

# -----------------------------------------
# 2. Logistics Aggregation
# -----------------------------------------
print("Aggregating Logistics...")
shipping_modes = df['Shipping Mode'].value_counts().to_dict()
shipping_modes_data = [{'name': k, 'value': v} for k, v in shipping_modes.items()]

delivery_status = df['Delivery Status'].value_counts().to_dict()
delivery_status_data = [{'name': k, 'value': v} for k, v in delivery_status.items()]

region_logistics = df.groupby('Order Region').agg(
    total_orders=('Order Id', 'count'),
    late_orders=('Late_delivery_risk', 'sum')
).reset_index()
region_logistics['late_rate'] = (region_logistics['late_orders'] / region_logistics['total_orders'] * 100).round(1)
region_logistics = region_logistics.sort_values('late_rate', ascending=False).head(5)
top_regions_logistics = region_logistics.to_dict('records')

# Monthly logistics performance
monthly_log = df.groupby(['Month', 'Delivery Status']).size().unstack(fill_value=0).reindex(month_order).fillna(0)
logistics_monthly = []
for month in month_order:
    logistics_monthly.append({
        'name': month,
        'onTime': int(monthly_log.loc[month].get('Shipping on time', 0)),
        'late': int(monthly_log.loc[month].get('Late delivery', 0)),
        'advance': int(monthly_log.loc[month].get('Advance shipping', 0))
    })

logistics_data = {
    'shippingModes': shipping_modes_data,
    'deliveryStatus': delivery_status_data,
    'topRegions': top_regions_logistics,
    'monthlyPerformance': logistics_monthly
}

# Top Canceled Products
canceled_df = df[df['Order Status'] == 'CANCELED']
if not canceled_df.empty:
    top_canceled = canceled_df.groupby('Product Name').agg(
        canceled_count=('Order Id', 'count'),
        lost_revenue=('Sales', 'sum')
    ).sort_values('canceled_count', ascending=False).head(3).reset_index()
    logistics_data['topCanceledProducts'] = top_canceled.to_dict('records')
else:
    logistics_data['topCanceledProducts'] = []

# Weekly logistics performance
df['order date (DateOrders)'] = pd.to_datetime(df['order date (DateOrders)'])
weekly_log_df = df.groupby(pd.Grouper(key='order date (DateOrders)', freq='W')).agg(
    late=('Late_delivery_risk', 'sum'),
    total=('Order Id', 'count')
).dropna().sort_index()

weekly_logistics = []
for date, row in weekly_log_df.iterrows():
    weekly_logistics.append({
        'date': date.strftime('%d %b %Y'),
        'month': date.strftime('%b'),
        'year': date.strftime('%Y'),
        'late': int(row['late']),
        'total': int(row['total'])
    })
logistics_data['weeklyPerformance'] = weekly_logistics

with open(os.path.join(output_dir, 'logistics.json'), 'w') as f:
    json.dump(logistics_data, f, indent=2)

# -----------------------------------------
# 3. Sales & Inventory Aggregation
# -----------------------------------------
print("Aggregating Sales...")
monthly_sales = df.groupby('Month').agg({'Sales': 'sum', 'Order Profit Per Order': 'sum', 'Order Item Discount': 'mean'}).reindex(month_order).fillna(0)
sales_monthly = []
for month in month_order:
    rev = float(monthly_sales.loc[month, 'Sales'])
    prof = float(monthly_sales.loc[month, 'Order Profit Per Order'])
    sales_monthly.append({
        'name': month,
        'revenue': rev,
        'profit': prof,
        'avgDiscount': float(monthly_sales.loc[month, 'Order Item Discount']),
        'profitMargin': (prof / rev * 100) if rev > 0 else 0
    })

# Weekly sales for jagged but not too detailed chart
print("Aggregating Weekly Sales...")
weekly_sales_df = df.groupby(pd.Grouper(key='order date (DateOrders)', freq='W')).agg({'Sales': 'sum', 'Order Profit Per Order': 'sum'}).dropna().sort_index()

weekly_sales = []
for date, row in weekly_sales_df.iterrows():
    if pd.isna(row['Sales']):
        continue
    weekly_sales.append({
        'date': date.strftime('%d %b %Y'),
        'month': date.strftime('%b'),
        'year': date.strftime('%Y'),
        'sales': float(row['Sales']),
        'profit': float(row['Order Profit Per Order'])
    })

category_sales = df.groupby('Category Name').agg({'Sales': 'sum', 'Order Profit Per Order': 'sum'}).sort_values('Sales', ascending=False).head(5).reset_index()
cat_sales_data = []
for _, row in category_sales.iterrows():
    cat_sales_data.append({
        'name': row['Category Name'],
        'sales': float(row['Sales']),
        'profit': float(row['Order Profit Per Order'])
    })

sales_data = {
    'monthlySales': sales_monthly,
    'weeklySales': weekly_sales,
    'topCategories': cat_sales_data
}
with open(os.path.join(output_dir, 'sales.json'), 'w') as f:
    json.dump(sales_data, f, indent=2)

# -----------------------------------------
# 4. Risk & Fraud Aggregation
# -----------------------------------------
print("Aggregating Risk & Fraud...")
# Fraud trend
fraud_df = df[df['Order Status'] == 'SUSPECTED_FRAUD']
fraud_monthly = fraud_df.groupby('Month').size().reindex(month_order).fillna(0)
total_monthly = df.groupby('Month').size().reindex(month_order).fillna(0)

risk_monthly = []
for month in month_order:
    fc = int(fraud_monthly.loc[month])
    tc = int(total_monthly.loc[month])
    risk_monthly.append({
        'name': month,
        'fraud': fc,
        'total': tc,
        'late': int(monthly_log.loc[month].get('Late delivery', 0)), # Adding late volume to risk chart
        'fraudRate': (fc / tc * 100) if tc > 0 else 0
    })

fraud_regions = fraud_df.groupby('Order Region').size().sort_values(ascending=False).head(5).reset_index(name='fraud_count')
fraud_regions_data = fraud_regions.to_dict('records')

# Threat map (limit to prevent massive JSON)
fraud_map_data = fraud_df.groupby(['Latitude', 'Longitude', 'Customer City', 'Customer Country']).size().reset_index(name='incidents').sort_values('incidents', ascending=False).head(50)
threat_map = []
for _, row in fraud_map_data.iterrows():
    if not math.isnan(row['Latitude']) and not math.isnan(row['Longitude']):
        threat_map.append({
            'lat': float(row['Latitude']),
            'lng': float(row['Longitude']),
            'city': str(row['Customer City']),
            'country': str(row['Customer Country']),
            'incidents': int(row['incidents']),
            'type': 'Fraud'
        })

late_df = df[df['Late_delivery_risk'] == 1]
late_map_data = late_df.groupby(['Latitude', 'Longitude', 'Customer City', 'Customer Country']).size().reset_index(name='incidents').sort_values('incidents', ascending=False).head(50)
for _, row in late_map_data.iterrows():
    if not math.isnan(row['Latitude']) and not math.isnan(row['Longitude']):
        threat_map.append({
            'lat': float(row['Latitude']),
            'lng': float(row['Longitude']),
            'city': str(row['Customer City']),
            'country': str(row['Customer Country']),
            'incidents': int(row['incidents']),
            'type': 'Late Risk'
        })

risk_data = {
    'monthlyTrend': risk_monthly,
    'topRegions': fraud_regions_data,
    'threatMap': threat_map
}
with open(os.path.join(output_dir, 'risk.json'), 'w') as f:
    json.dump(risk_data, f, indent=2)

print("Aggregation complete! JSON files saved to src/data/")
