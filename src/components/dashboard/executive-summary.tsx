"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { MoreVertical, ArrowUpRight, RefreshCw, AlertTriangle, TrendingUp, Info, Activity, Boxes, Clock, Globe2, MapPin, Truck } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter, ZAxis, ComposedChart, Line } from "recharts"
import { useDashboard } from "@/components/dashboard-provider"
import { cn } from "@/lib/utils"

import overviewData from '@/data/overview.json'
import salesDataJson from '@/data/sales.json'
import riskDataJson from '@/data/risk.json'
import logisticsDataJson from '@/data/logistics.json'

const salesTrendData = salesDataJson.monthlySales.map(d => ({
  month: d.name,
  sales: d.revenue,
  profit: d.profit
}))

const categoryProfitData = salesDataJson.topCategories.map(d => ({
  name: d.name,
  revenue: d.sales,
  profit: (d.profit / d.sales * 100)
}))

const highRiskData = riskDataJson.topRegions.map(d => ({
  city: d['Order Region'],
  risk: d.fraud_count * 5, // scaled for display
  orders: d.fraud_count * 100
}))

const COLORS = {
  orange: '#FF6B00',
  navy: '#1E3A8A',
  gray: '#E2E8F0',
  red: '#EF4444',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const salesStr = (data.sales / 1000).toFixed(0);
    return (
      <div className="bg-[#0f172a] text-white p-4 rounded-xl shadow-2xl min-w-[240px] z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[13px] text-slate-300 font-medium">{data.date || label}</span>
          <Info className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[34px] font-bold leading-none">{salesStr}</span>
            <div className="text-[11px] text-slate-400 leading-tight">
              K gross <br/> sales
            </div>
          </div>
          <div className="bg-[#10b981] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm">
            +1.1%
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex mb-3 opacity-90">
          <div className="bg-[#ff6b00] h-full" style={{width: '51.5%'}} title="Consumer"></div>
          <div className="bg-slate-200 h-full" style={{width: '30.2%'}} title="Corporate"></div>
          <div className="bg-slate-500 h-full" style={{width: '18.3%'}} title="Home Office"></div>
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-300">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#ff6b00]"></div>Consumer</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-slate-200"></div>Corporate</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-slate-500"></div>Home Office</div>
        </div>
      </div>
    );
  }
  return null;
};

export function ExecutiveSummary() {
  const { filters } = useDashboard()
  const [salesData, setSalesData] = React.useState(salesDataJson.weeklySales || [])
  const [timeRange, setTimeRange] = React.useState('All Time')
  
  const totalOrders = overviewData.summary.totalOrders
  const onTimeCount = logisticsDataJson.deliveryStatus.find(d => d.name === 'Shipping on time')?.value || 0;
  const advanceCount = logisticsDataJson.deliveryStatus.find(d => d.name === 'Advance shipping')?.value || 0;
  const lateCount = logisticsDataJson.deliveryStatus.find(d => d.name === 'Late delivery')?.value || 0;
  const canceledCount = logisticsDataJson.deliveryStatus.find(d => d.name === 'Shipping canceled')?.value || 0;
  
  // Compliance combines On-Time and Advance
  const compliantCount = onTimeCount + advanceCount;
  const complianceRate = ((compliantCount / totalOrders) * 100).toFixed(1)
  // We use the real weeklySales data directly
  React.useEffect(() => {
    let rawData = salesDataJson.weeklySales || [];
    if (timeRange !== 'All Time') {
      rawData = rawData.filter((d: any) => d.year === timeRange);
    }
    setSalesData(rawData)
  }, [filters, timeRange])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* ================= LEFT COLUMN ================= */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
        
        {/* SLA Compliance Rate Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px]">✓</div>
              SLA Compliance
            </h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-5 w-5" /></button>
          </div>
          
          <div className="h-[180px] relative -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {name: 'On-Time', value: onTimeCount}, 
                    {name: 'Advance', value: advanceCount}, 
                    {name: 'Late/Canceled', value: lateCount + canceledCount}
                  ]}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={110}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  <Cell fill="#FF6B00" />
                  <Cell fill="#10B981" />
                  <Cell fill="#E2E8F0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className="text-3xl leading-none font-extrabold text-slate-900">{complianceRate}%</span>
              <span className="text-xs font-semibold text-slate-500 mt-1">SLA Compliant</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-8 text-center pt-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <div className="w-3 h-3 rounded-md bg-[#FF6B00]"></div>
                <span className="text-xs font-semibold text-slate-500">On-Time</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{onTimeCount.toLocaleString('en-US')}</span>
            </div>
            <div className="w-px bg-slate-100"></div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <div className="w-3 h-3 rounded-md bg-[#10B981]"></div>
                <span className="text-xs font-semibold text-slate-500">Advance</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{advanceCount.toLocaleString('en-US')}</span>
            </div>
            <div className="w-px bg-slate-100"></div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <div className="w-3 h-3 rounded-md bg-slate-200"></div>
                <span className="text-xs font-semibold text-slate-500">Late</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{lateCount.toLocaleString('en-US')}</span>
            </div>
          </div>
        </Card>

        {/* Logistics Financial Impact Card */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#FF6B00] text-white flex items-center justify-center">
                <AlertTriangle className="w-3 h-3" />
              </div>
              Financial Impact
            </h3>
            <button className="text-[#FF6B00] text-xs font-bold flex items-center gap-1 hover:underline">
               Refresh <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Risk Factor</span>
              <div className="flex gap-4 text-right">
                <span className="w-16">Impact %</span>
                <span className="w-20">Lost Value</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Late Deliveries</span>
              <div className="flex gap-4 text-right items-center">
                <span className="w-16 text-sm font-semibold text-slate-500">6.2%</span>
                <span className="w-20 text-sm font-bold text-slate-900">$1.24M</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Canceled Orders</span>
              <div className="flex gap-4 text-right items-center">
                <span className="w-16 text-sm font-semibold text-slate-500">1.8%</span>
                <span className="w-20 text-sm font-bold text-[#EF4444]">$892K</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Damaged Goods</span>
              <div className="flex gap-4 text-right items-center">
                <span className="w-16 text-sm font-semibold text-slate-500">0.4%</span>
                <span className="w-20 text-sm font-bold text-slate-900">$145K</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Total Value at Risk</h4>
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <div className="text-2xl font-extrabold text-slate-900">$2.27M</div>
                   <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">+4.2%</span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 mb-2">30-Day Exposure</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#EF4444] h-full w-[12%]"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Canceled Products Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#EF4444] text-white flex items-center justify-center">
                <AlertTriangle className="w-3 h-3" />
              </div>
              Top Canceled Products
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {((logisticsDataJson as any).topCanceledProducts || []).map((prod: any, i: number) => {
              const maxCanceled = Math.max(...((logisticsDataJson as any).topCanceledProducts || []).map((p:any) => p.canceled_count), 1);
              const percentage = ((prod.canceled_count / maxCanceled) * 100).toFixed(1);
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start text-sm">
                    <span className="font-bold text-slate-700 leading-tight pr-4 line-clamp-1" title={prod['Product Name']}>{prod['Product Name']}</span>
                    <span className="font-bold text-[#EF4444] whitespace-nowrap">{prod.canceled_count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#EF4444] h-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    ${(prod.lost_revenue / 1000).toFixed(1)}K lost value
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
        
        {/* New Top Row: 4 Compact KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col justify-center min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Activity className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold">Total Profit Margin</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{overviewData.summary.avgProfitMargin.toFixed(1)}%</span>
              <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-sm">+1.2%</span>
            </div>
          </Card>
          
          <Card className="p-6 flex flex-col justify-center min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Boxes className="w-4 h-4 text-[#FF6B00]" />
              <span className="text-xs font-bold">Total Inventory Moved</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{Math.round(totalOrders / 1000)}K</span>
              <span className="text-[10px] font-bold text-slate-500">Units</span>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Clock className="w-4 h-4 text-[#1E3A8A]" />
              <span className="text-xs font-bold">Avg Delivery Lead</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">3.2</span>
              <span className="text-[10px] font-bold text-slate-500">Days</span>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Globe2 className="w-4 h-4 text-[#0284c7]" />
              <span className="text-xs font-bold">Active Global Markets</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">5</span>
              <span className="text-[10px] font-bold text-slate-500">Regions</span>
            </div>
          </Card>
        </div>

        {/* Total Sales & Order Breakdown (Main Large Card) */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              Total Sales & Order Breakdown
            </h3>
            
            {/* Year Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
              {['2015', '2016', '2017', 'All Time'].map(range => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-full transition-colors",
                    timeRange === range 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-10">
            {/* Left side of the card: Big number & Breakdown */}
            <div className="w-full xl:w-[30%] flex flex-col">
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[46px] leading-tight font-extrabold text-slate-900 tracking-tight">${(overviewData.summary.totalRevenue / 1000000).toFixed(2)}M</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Gross Sales Volume</span>
                  <Link href="/sales-inventory" className="px-3 py-1 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Details</Link>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#FF6B00] rounded-full"></div>
                      Consumer
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1.5 flex">
                     <div className="bg-[#FF6B00] h-full w-[51.5%] rounded-full"></div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">51.5% · $18.94M Revenue</div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#1E3A8A] rounded-full"></div>
                      Corporate
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1.5 flex">
                     <div className="bg-[#1E3A8A] h-full w-[30.2%] rounded-full"></div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">30.2% · $11.10M Revenue</div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-slate-400 rounded-full"></div>
                      Home Office
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1.5 flex">
                     <div className="bg-slate-400 h-full w-[18.3%] rounded-full"></div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">18.3% · $6.73M Revenue</div>
                </div>
              </div>
            </div>
            
            {/* Right side of the card: Area Chart */}
            <div className="w-full xl:w-[70%] h-[340px] bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalesOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => {
                      const parts = value.split(' '); // ["01", "Jan", "2015"]
                      if (!parts || parts.length < 3) return value;
                      if (timeRange === 'All Time') {
                        return `${parts[1]} '${parts[2].substring(2)}`; // e.g., "Jan '15"
                      }
                      return `${parts[0]} ${parts[1]}`; // e.g., "14 Jun" to avoid repeating months
                    }}
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}} 
                    dy={15} 
                    minTickGap={40}
                  />
                  <YAxis hide domain={['dataMin', 'dataMax + 2000']} />
                  <RechartsTooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#FF6B00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorSalesOrange)" 
                    activeDot={{ r: 5, fill: '#0f172a', stroke: '#ff6b00', strokeWidth: 3 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Bottom Area (Split into 2 cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: High-Risk Delivery Regions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-900 text-white rounded-md flex items-center justify-center text-[10px]">
                  <AlertTriangle className="w-3 h-3" />
                </div>
                High-Risk Delivery Regions
              </h3>
            </div>
            
            <div className="w-full h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={highRiskData} 
                  layout="vertical" 
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 30]} />
                  <YAxis type="category" dataKey="city" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569', fontWeight: 600}} width={100} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)', padding: '10px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number, name: string) => [`${value}%`, 'Late Delivery Risk']}
                  />
                  <Bar dataKey="risk" fill="#EF4444" radius={[0, 4, 4, 0]}>
                    {highRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Card 2: Top Profitable Categories */}
          <Card className="p-6">
             <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
                <div className="w-5 h-5 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center">
                   <TrendingUp className="w-3 h-3" />
                </div>
                Top Profitable Categories
              </h3>
            </div>
            
            <div className="h-[290px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={categoryProfitData} margin={{ top: 10, right: 0, bottom: 0, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `$${v/1000}k`} width={55} />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Revenue') return [`$${(value/1000).toLocaleString('en-US')}k`, name];
                      return [`${value}%`, 'Profit Margin'];
                    }}
                  />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={32} />
                  <Line yAxisId="right" dataKey="profit" name="Profit Margin" type="monotone" stroke="#10B981" strokeWidth={3} dot={{r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-3 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-[#1e293b] rounded-sm"></div> Revenue</div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div> Margin %</div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
