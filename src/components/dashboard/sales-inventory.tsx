"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Search,
  ScatterChart as ScatterIcon,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Globe2,
  Tags,
  BarChart as BarChartIcon
} from "lucide-react"
import { 
  ResponsiveContainer, 
  AreaChart, Area, 
  ComposedChart, Line,
  ScatterChart, Scatter, 
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ZAxis, ReferenceArea, ReferenceLine, Legend
} from "recharts"
import { cn } from "@/lib/utils"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'

import salesDataJson from '@/data/sales.json'

// --- Mock Data ---

const macroTrendData = salesDataJson.monthlySales.map(d => ({
  month: d.name,
  revenue: d.revenue / 1000000,
  volume: Math.round(d.revenue / 100000) // Scale to fit the existing 'volume' chart line (which is in tens/hundreds usually)
}))

const yearlyTrendData = [
  { month: "2019", revenue: 18.5, volume: 110 }, { month: "2020", revenue: 22.1, volume: 145 },
  { month: "2021", revenue: 26.8, volume: 180 }, { month: "2022", revenue: 29.5, volume: 195 },
  { month: "2023", revenue: 32.1, volume: 220 }, { month: "2024", revenue: 36.7, volume: 248 },
]

const topCategories = salesDataJson.topCategories.map(c => ({
  name: c.name,
  sales: c.sales,
  margin: (c.profit / c.sales) * 100
}))

const scatterData = [
  { discount: 0, profit: 45, category: 'Electronics' },
  { discount: 2, profit: 42, category: 'Apparel' },
  { discount: 5, profit: 38, category: 'Home' },
  { discount: 8, profit: 30, category: 'Sports' },
  { discount: 10, profit: 25, category: 'Toys' },
  { discount: 15, profit: 10, category: 'Books' },
  { discount: 18, profit: 5, category: 'Garden' },
  { discount: 22, profit: -12, category: 'Clearance' },
  { discount: 25, profit: -25, category: 'Liquidation' },
]

const segmentData = [
  { name: "Consumer", value: 18.5, color: "#1E3A8A" },
  { name: "Corporate", value: 12.2, color: "#10B981" },
  { name: "Home Office", value: 6.0, color: "#FF6B00" },
]

const marketData = [
  { market: "Europe", sales: 10.8 },
  { market: "LATAM", sales: 10.2 },
  { market: "Pacific Asia", sales: 8.2 },
  { market: "USCA", sales: 5.0 },
  { market: "Africa", sales: 2.2 },
]

const departmentData = [
  { name: "Fan Shop", value: 12.4, color: "#8B5CF6" },
  { name: "Apparel", value: 8.5, color: "#3B82F6" },
  { name: "Golf", value: 6.2, color: "#06B6D4" },
  { name: "Footwear", value: 5.4, color: "#F43F5E" },
  { name: "Outdoors", value: 4.2, color: "#F59E0B" },
]

type CustomerData = {
  id: string
  segment: 'Consumer' | 'Corporate' | 'Home Office'
  orders: number
  spend: number
  lastOrder: string
}

const tableData: CustomerData[] = [
  { id: 'CUST-10492', segment: 'Corporate', orders: 124, spend: 45290.50, lastOrder: '2026-10-05' },
  { id: 'CUST-88392', segment: 'Consumer', orders: 86, spend: 12450.00, lastOrder: '2026-10-04' },
  { id: 'CUST-59201', segment: 'Home Office', orders: 42, spend: 18920.75, lastOrder: '2026-10-02' },
  { id: 'CUST-11029', segment: 'Corporate', orders: 215, spend: 89000.00, lastOrder: '2026-10-01' },
  { id: 'CUST-99234', segment: 'Consumer', orders: 12, spend: 3450.25, lastOrder: '2026-09-28' },
  { id: 'CUST-33019', segment: 'Home Office', orders: 67, spend: 28400.00, lastOrder: '2026-09-25' },
  { id: 'CUST-77210', segment: 'Consumer', orders: 53, spend: 8400.00, lastOrder: '2026-09-22' },
  { id: 'CUST-40291', segment: 'Corporate', orders: 180, spend: 65200.00, lastOrder: '2026-09-21' },
]

// --- Table Setup ---

const columnHelper = createColumnHelper<CustomerData>()

const columns = [
  columnHelper.accessor('id', {
    header: 'Customer ID',
    cell: info => <span className="font-bold text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor('segment', {
    header: 'Segment',
    cell: info => {
      const seg = info.getValue()
      let bg = "bg-slate-100 text-slate-600 ring-slate-200"
      if (seg === 'Corporate') bg = "bg-blue-50 text-[#1E3A8A] ring-[#1E3A8A]/20"
      if (seg === 'Consumer') bg = "bg-green-50 text-[#10B981] ring-[#10B981]/20"
      if (seg === 'Home Office') bg = "bg-orange-50 text-[#FF6B00] ring-[#FF6B00]/20"
      return (
        <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ring-1", bg)}>
          {seg}
        </span>
      )
    },
  }),
  columnHelper.accessor('orders', {
    header: 'Total Orders',
    cell: info => <span className="font-semibold text-slate-600">{info.getValue()}</span>,
  }),
  columnHelper.accessor('spend', {
    header: 'Total Spend',
    cell: info => <span className="font-bold text-slate-900">${info.getValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>,
  }),
  columnHelper.accessor('lastOrder', {
    header: 'Last Order Date',
    cell: info => <span className="text-sm font-medium text-slate-500">{info.getValue()}</span>,
  }),
]

// --- Tooltip Styles ---
const customTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)',
  backgroundColor: '#ffffff'
}

export function SalesInventory() {
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [trendView, setTrendView] = React.useState<'Monthly' | 'Yearly'>('Monthly')

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 }
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ROW 1: Commercial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Revenue</p>
              <h2 className="text-3xl font-extrabold text-slate-900">$36.7M</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3" /> +5.2% vs last month
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Profit</p>
              <h2 className="text-3xl font-extrabold text-slate-900">$3.9M</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Avg Margin: <span className="text-slate-600">10.7%</span></p>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Items Sold</p>
              <h2 className="text-3xl font-extrabold text-slate-900">180,519</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Inventory Volume Moved</p>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Average Order Value (AOV)</p>
              <h2 className="text-3xl font-extrabold text-slate-900">$183.50</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
             Consistent across segments
          </div>
        </Card>
      </div>

      {/* ROW 2: Macro Trends & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue & Demand Trend (8 spans) */}
        <Card className="p-6 lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              Revenue & Demand Trend
            </h3>
            {/* Toggle Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setTrendView('Monthly')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", trendView === 'Monthly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTrendView('Yearly')}
                className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", trendView === 'Yearly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Yearly
              </button>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendView === 'Monthly' ? macroTrendData : yearlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `$${v}M`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `${v}k`} />
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(value: any, name: any) => [name === 'Revenue' ? `$${value}M` : `${value}k`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Items Sold" stroke="#FF6B00" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Top Profitable Categories (4 spans) */}
        <Card className="p-6 lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              Top Profitable Categories
            </h3>
          </div>
          
          <div className="h-[280px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={topCategories} margin={{ top: 20, right: 0, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                  dy={10} 
                  interval={0}
                  tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} 
                  width={55}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  hide 
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Revenue') return [`$${(value / 1000).toFixed(0)}k`, name];
                    return [`${value.toFixed(1)}%`, name];
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '15px' }} />
                <Bar yAxisId="left" dataKey="sales" name="Revenue" fill="#1e293b" barSize={28} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="margin" name="Margin %" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981'}} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* NEW ROW 3: Market Penetration & Department Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Market Penetration (6 spans) */}
        <Card className="p-6 lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0284c7] flex items-center justify-center">
                <Globe2 className="w-3 h-3 text-white" />
              </div>
              Sales Penetration by Global Market
            </h3>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="market" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `$${v}M`} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ display: 'none' }}
                  formatter={(val: any) => [`$${val}M`, 'Total Sales']}
                />
                <Bar dataKey="sales" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Revenue by Department (6 spans) */}
        <Card className="p-6 lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center">
                <Tags className="w-3 h-3 text-white" />
              </div>
              Revenue by Department
            </h3>
          </div>
          
          <div className="flex-1 h-[250px] relative w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={0}
                  dataKey="value"
                  stroke="none"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ fontWeight: 700 }}
                  formatter={(value: any) => [`$${value}M`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex items-center justify-center flex-wrap gap-4 mt-2">
            {departmentData.map((dept, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-[11px] font-bold text-slate-600">{dept.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 4: Pricing Strategy & Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Profitability vs Discount (6 spans) */}
        <Card className="p-6 lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#EF4444] flex items-center justify-center">
                <BarChartIcon className="w-3 h-3 text-white" />
              </div>
              Profitability vs Discount Impact
            </h3>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={scatterData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                <ReferenceLine yAxisId="left" y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Bar yAxisId="left" dataKey="profit" name="Profit Margin" fill="#1E3A8A" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {
                    scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit < 0 ? '#EF4444' : '#1E3A8A'} />
                    ))
                  }
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="discount" name="Avg Discount" stroke="#06B6D4" strokeWidth={3} dot={{r: 4, fill: '#06B6D4', stroke: '#fff', strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Sales by Segment (6 spans) */}
        <Card className="p-6 lg:col-span-6 flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <PieChartIcon className="w-3 h-3 text-white" />
            </div>
            Sales by Customer Segment
          </h3>
          <p className="text-xs font-bold text-slate-400 mb-6">Revenue share breakdown</p>
          
          <div className="flex-1 h-[250px] relative w-full flex items-center">
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-10">
                <span className="text-3xl font-extrabold text-slate-900">$36.7M</span>
                <span className="text-xs font-bold text-slate-400">Total Revenue</span>
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ fontWeight: 700 }}
                  formatter={(value: any) => [`$${value}M`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex items-center justify-center gap-6 mt-2">
            {segmentData.map((seg, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-sm font-bold text-slate-600">{seg.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 5: Detailed Customer & Inventory Table */}
      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Top Customers & Purchasing Behavior</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">RFM Analysis based segmentation</p>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID or Segment..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent w-full md:w-[280px]"
            />
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-100">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-sm font-medium text-slate-500">
                    No customers found matching "{globalFilter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-xs font-bold text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
      
    </div>
  )
}
