"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Clock, TrendingDown, TrendingUp, XCircle, PackageX, Truck, PieChart as PieChartIcon, ChevronLeft, ChevronRight, Activity, BarChart2 } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, BarChart, Bar, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts"
import { useDashboard } from "@/components/dashboard-provider"
import { cn } from "@/lib/utils"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table'

import logisticsData from '@/data/logistics.json'

const deliveryStatusData = [
  { name: 'On-Time', value: logisticsData.deliveryStatus.find(d => d.name === 'Shipping on time')?.value || 0 },
  { name: 'Late', value: logisticsData.deliveryStatus.find(d => d.name === 'Late delivery')?.value || 0 },
  { name: 'Advance', value: logisticsData.deliveryStatus.find(d => d.name === 'Advance shipping')?.value || 0 },
  { name: 'Canceled', value: logisticsData.deliveryStatus.find(d => d.name === 'Shipping canceled')?.value || 0 },
]
const TOTAL_ORDERS = deliveryStatusData.reduce((acc, curr) => acc + curr.value, 0);

const workloadData = [
  { mode: 'Standard', volume: 65200, profit: 12.5 },
  { mode: 'Second Class', volume: 18400, profit: 15.2 },
  { mode: 'First Class', volume: 8200, profit: 22.4 },
  { mode: 'Same Day', volume: 2429, profit: 8.5 },
];



const leadTimeData = [
  { mode: 'First Class', scheduled: 2.1, actual: 2.5 },
  { mode: 'Second Class', scheduled: 4.5, actual: 5.2 },
  { mode: 'Standard Class', scheduled: 6.2, actual: 7.8 },
  { mode: 'Same Day', scheduled: 0.5, actual: 0.8 },
]

type RouteData = {
  region: string
  city: string
  shippingMode: string
  lateRate: number
  affected: number
}

const tableData: RouteData[] = logisticsData.topRegions.map(r => ({
  region: r["Order Region"],
  city: 'Multiple',
  shippingMode: 'Mixed',
  lateRate: r.late_rate,
  affected: r.total_orders
}))

const columnHelper = createColumnHelper<RouteData>()

const columns = [
  columnHelper.accessor('region', {
    header: 'Order Region',
    cell: info => <span className="font-semibold text-slate-700">{info.getValue()}</span>,
  }),
  columnHelper.accessor('city', {
    header: 'City',
    cell: info => <span className="font-bold text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor('shippingMode', {
    header: 'Shipping Mode',
    cell: info => (
      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[11px] font-bold">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('lateRate', {
    header: 'Late Delivery Rate',
    cell: info => {
      const val = info.getValue()
      return (
        <span className={cn("font-bold", val > 20 ? "text-[#EF4444]" : "text-[#FF6B00]")}>
          {val.toFixed(1)}%
        </span>
      )
    },
  }),
  columnHelper.accessor('affected', {
    header: 'Total Orders Affected',
    cell: info => <span className="font-semibold text-slate-600">{info.getValue().toLocaleString('en-US')}</span>,
  }),
]

export function LogisticsDelivery() {
  const { filters } = useDashboard()
  const [timeRange, setTimeRange] = React.useState<"All Time" | "2015" | "2016" | "2017">("All Time")

  const historicalLateData = React.useMemo(() => {
    if (timeRange === "All Time") {
      return logisticsData.monthlyPerformance.map(m => ({
        date: m.name,
        late: m.late
      }))
    } else {
      // @ts-ignore
      return logisticsData.weeklyPerformance
        .filter((w: any) => w.year === timeRange)
        .map((w: any) => ({
          date: w.date,
          month: w.month,
          late: w.late
        }))
    }
  }, [timeRange])

  const handleExportCSV = () => {
    if (!tableData || tableData.length === 0) return;
    const headers = Object.keys(tableData[0]).join(',');
    const rows = tableData.map(row => {
      return Object.values(row).map(value => {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'logistics_bottlenecks_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 5 }
    }
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Top Section: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Total Late Deliveries</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-extrabold text-slate-900 leading-none">
              {deliveryStatusData.find(d => d.name === 'Late')?.value.toLocaleString('en-US')}
            </span>
            <span className="text-[#EF4444] text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
            </span>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-[#EF4444]">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#EF4444]">Cost of Late Deliveries</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-extrabold text-[#EF4444] leading-none">$20.1M</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2">Penalties & compensation</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-[#FF6B00]">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <PackageX className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">Canceled Orders Cost</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-extrabold text-[#FF6B00] leading-none">$1.5M</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2">1,102 canceled orders</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Truck className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Avg Lead Time Dev</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-extrabold text-[#EF4444] leading-none">+1.6</span>
            <span className="text-sm font-bold text-slate-500">Days</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2">Actual vs Scheduled</p>
        </Card>
      </div>

      {/* 2. Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Donut Chart (4 spans) */}
        <Card className="p-6 lg:col-span-4 flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
              <PieChartIcon className="w-3 h-3 text-white" />
            </div>
            Delivery Status Breakdown
          </h3>
          
          <div className="min-h-[200px] relative w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  <Cell fill="#1E3A8A" /> {/* On-Time */}
                  <Cell fill="#FF6B00" /> {/* Late */}
                  <Cell fill="#10B981" /> {/* Advance */}
                  <Cell fill="#EF4444" /> {/* Canceled */}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 mt-1">{TOTAL_ORDERS.toLocaleString('en-US')}</span>
              <span className="text-xs font-bold text-slate-500">Total Orders</span>
            </div>
          </div>
          
          {/* Custom Legend (Premium Boxes) */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {deliveryStatusData.map((entry, index) => {
              const colors = ["#1E3A8A", "#FF6B00", "#10B981", "#EF4444"];
              const percentage = ((entry.value / TOTAL_ORDERS) * 100).toFixed(1);
              return (
                <div key={entry.name} className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: colors[index] }}></div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-slate-900 leading-none">{entry.value.toLocaleString('en-US')}</span>
                    <span className="text-[11px] font-extrabold" style={{ color: colors[index] }}>{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Right: Composed Chart (8 spans) */}
        <Card className="p-6 lg:col-span-8 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1E3A8A] flex items-center justify-center text-white text-[10px]">L</div>
              Average Lead Time Deviation
            </h3>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leadTimeData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mode" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                <Bar dataKey="scheduled" name="Scheduled Days" barSize={32} fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="actual" name="Actual Days" stroke="#FF6B00" strokeWidth={3} dot={{r: 6, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2}} activeDot={{r: 8}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* NEW ROW 3: Shipping Capacity & Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Shipping Workload & Profitability (5 spans) */}
        <Card className="p-6 lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center">
                <BarChart2 className="w-3 h-3 text-white" />
              </div>
              Shipping Workload & Profit Margin
            </h3>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={workloadData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" xAxisId="volume" hide />
                <XAxis type="number" xAxisId="profit" hide />
                <YAxis dataKey="mode" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ display: 'none' }}
                  formatter={(val: number, name: string) => [
                    name === 'Order Volume' ? val.toLocaleString('en-US') : `${val}%`,
                    name
                  ]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingBottom: '20px' }} verticalAlign="top" align="right" />
                <Bar dataKey="volume" xAxisId="volume" name="Order Volume" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                <Line dataKey="profit" xAxisId="profit" name="Profit Margin (%)" type="monotone" stroke="#FF6B00" strokeWidth={2} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Late Delivery Trend (Historical) (7 spans) */}
        <Card className="p-6 lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#EF4444] flex items-center justify-center">
                <Activity className="w-3 h-3 text-white" />
              </div>
              Late Delivery Trend (Historical)
            </h3>
            
            <div className="flex bg-slate-100/80 p-1 rounded-lg">
              {(["All Time", "2015", "2016", "2017"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={cn(
                    "px-3 py-1 text-[11px] font-bold rounded-md transition-all",
                    timeRange === t 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalLateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} 
                  dy={10} 
                  minTickGap={20} 
                  tickFormatter={(val) => val.includes(' ') ? val.split(' ')[1] : val}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="late" name="Late Deliveries" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorLate)" activeDot={{ r: 6, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. Bottom Section: Data Table */}
      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-100">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            Bottleneck Routes & High-Risk Regions
          </h3>
          <button onClick={handleExportCSV} className="px-4 py-1.5 text-xs font-bold rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer active:scale-95">Export CSV</button>
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
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
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
