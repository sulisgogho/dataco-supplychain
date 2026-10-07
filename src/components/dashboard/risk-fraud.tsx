"use client"

import * as React from "react"
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps"
import { Card } from "@/components/ui/card"
import { 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  PackageX,
  DollarSign,
  Activity,
  MapPin,
  Target,
  BrainCircuit,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  ScatterChart, Scatter,
  BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ZAxis,
  Cell, Legend
} from "recharts"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'

import riskDataJson from '@/data/risk.json'
import overviewDataJson from '@/data/overview.json'

// --- Mock Data ---

const kpiData = {
  ordersAtRisk: overviewDataJson.summary.lateDeliveries,
  revenueAtRisk: overviewDataJson.summary.totalRevenue * (overviewDataJson.summary.lateDeliveries / overviewDataJson.summary.totalOrders),
  suspectedFraud: overviewDataJson.summary.fraudAttempts,
  fraudValue: (overviewDataJson.summary.totalRevenue / overviewDataJson.summary.totalOrders) * overviewDataJson.summary.fraudAttempts
}

// Map scatter: x=longitude, y=latitude
const threatMapData = riskDataJson.threatMap.map((t: any) => ({
  lng: t.lng,
  lat: t.lat,
  city: t.city,
  type: t.type,
  z: t.incidents
}))

const fraudCategoriesData = [
  { category: "Electronics", attempts: 45 },
  { category: "Cleats", attempts: 28 },
  { category: "Apparel", attempts: 15 },
  { category: "Computers", attempts: 12 },
  { category: "Toys", attempts: 8 },
]

const radarData = [
  { subject: 'Weather Delay', A: 85, fullMark: 100 },
  { subject: 'Shipping Distance', A: 65, fullMark: 100 },
  { subject: 'Courier Cap', A: 90, fullMark: 100 },
  { subject: 'Product Vol.', A: 40, fullMark: 100 },
  { subject: 'Day of Week', A: 55, fullMark: 100 },
  { subject: 'Holiday Peak', A: 75, fullMark: 100 },
]

const trendData = riskDataJson.monthlyTrend.map(d => ({
  day: d.name,
  late: d.late,
  fraud: d.fraud
}))

type DeliveryRisk = {
  orderId: string
  city: string
  shippingMode: string
  category: string
  riskProbability: number
}

const deliveryRiskData: DeliveryRisk[] = [
  { orderId: 'ORD-98213', city: 'Santo Domingo', shippingMode: 'Standard Class', category: 'Fishing', riskProbability: 92 },
  { orderId: 'ORD-99102', city: 'New York City', shippingMode: 'Second Class', category: 'Cleats', riskProbability: 84 },
  { orderId: 'ORD-10293', city: 'Manila', shippingMode: 'Standard Class', category: 'Camping', riskProbability: 65 },
  { orderId: 'ORD-54921', city: 'London', shippingMode: 'Standard Class', category: 'Cardio', riskProbability: 58 },
  { orderId: 'ORD-88123', city: 'Los Angeles', shippingMode: 'First Class', category: 'Water', riskProbability: 12 },
  { orderId: 'ORD-23910', city: 'Tegucigalpa', shippingMode: 'Standard Class', category: 'Fishing', riskProbability: 95 },
  { orderId: 'ORD-30129', city: 'Paris', shippingMode: 'Second Class', category: 'Electronics', riskProbability: 25 },
  { orderId: 'ORD-44912', city: 'Berlin', shippingMode: 'Standard Class', category: 'Camping', riskProbability: 40 },
]

type FraudAlert = {
  transactionId: string
  paymentType: 'TRANSFER' | 'DEBIT' | 'CASH' | 'PAYMENT'
  market: string
  anomalyScore: number
  status: 'Pending Review' | 'Blocked' | 'Cleared'
}

const fraudAlertData: FraudAlert[] = [
  { transactionId: 'TRX-100293', paymentType: 'TRANSFER', market: 'LATAM', anomalyScore: 94, status: 'Pending Review' },
  { transactionId: 'TRX-993821', paymentType: 'TRANSFER', market: 'Europe', anomalyScore: 88, status: 'Pending Review' },
  { transactionId: 'TRX-559123', paymentType: 'DEBIT', market: 'North America', anomalyScore: 12, status: 'Cleared' },
  { transactionId: 'TRX-229103', paymentType: 'TRANSFER', market: 'Asia Pacific', anomalyScore: 85, status: 'Blocked' },
  { transactionId: 'TRX-441029', paymentType: 'PAYMENT', market: 'LATAM', anomalyScore: 35, status: 'Cleared' },
  { transactionId: 'TRX-882910', paymentType: 'TRANSFER', market: 'Africa', anomalyScore: 91, status: 'Pending Review' },
  { transactionId: 'TRX-119203', paymentType: 'CASH', market: 'Europe', anomalyScore: 5, status: 'Cleared' },
  { transactionId: 'TRX-330192', paymentType: 'TRANSFER', market: 'North America', anomalyScore: 81, status: 'Pending Review' },
]

// --- Column Helpers ---

const riskHelper = createColumnHelper<DeliveryRisk>()
const fraudHelper = createColumnHelper<FraudAlert>()

const riskColumns = [
  riskHelper.accessor('orderId', {
    header: 'Order ID',
    cell: info => <span className="font-bold text-slate-900">{info.getValue()}</span>,
  }),
  riskHelper.accessor('city', {
    header: 'Destination City',
    cell: info => <span className="font-semibold text-slate-700">{info.getValue()}</span>,
  }),
  riskHelper.accessor('shippingMode', {
    header: 'Shipping Mode',
    cell: info => <span className="text-sm font-medium text-slate-600">{info.getValue()}</span>,
  }),
  riskHelper.accessor('category', {
    header: 'Product Category',
    cell: info => <span className="text-sm font-medium text-slate-600">{info.getValue()}</span>,
  }),
  riskHelper.accessor('riskProbability', {
    header: 'AI Risk Probability',
    cell: info => {
      const risk = info.getValue()
      let bg = "bg-green-100 text-green-700 border-green-200"
      if (risk >= 80) bg = "bg-red-100 text-red-700 border-red-200"
      else if (risk >= 50) bg = "bg-yellow-100 text-yellow-700 border-yellow-200"
      
      return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-extrabold border", bg)}>
          {risk}% RISK
        </span>
      )
    },
  }),
  riskHelper.display({
    id: 'actions',
    header: 'Action',
    cell: props => {
      const risk = props.row.original.riskProbability
      if (risk >= 50) {
        return (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm">
            <Zap className="w-3 h-3" /> Upgrade to First Class
          </button>
        )
      }
      return (
         <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
           <CheckCircle2 className="w-4 h-4 text-green-500" /> On Track
         </span>
      )
    },
  }),
]

const fraudColumns = [
  fraudHelper.accessor('transactionId', {
    header: 'Transaction ID',
    cell: info => <span className="font-bold text-slate-900">{info.getValue()}</span>,
  }),
  fraudHelper.accessor('paymentType', {
    header: 'Payment Type',
    cell: info => {
      const type = info.getValue()
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
          type === 'TRANSFER' ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-slate-100 text-slate-600"
        )}>
          {type}
        </span>
      )
    },
  }),
  fraudHelper.accessor('market', {
    header: 'Market Location',
    cell: info => <span className="font-semibold text-slate-700">{info.getValue()}</span>,
  }),
  fraudHelper.accessor('anomalyScore', {
    header: 'Anomaly Score',
    cell: info => {
      const score = info.getValue()
      return (
        <span className={cn("font-extrabold text-[15px]", score >= 80 ? "text-red-600" : "text-slate-700")}>
          {score}%
        </span>
      )
    },
  }),
  fraudHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const status = info.getValue()
      let color = "text-slate-500"
      if (status === 'Blocked') color = "text-red-600"
      if (status === 'Cleared') color = "text-green-600"
      return <span className={cn("text-xs font-bold", color)}>{status}</span>
    },
  }),
  fraudHelper.display({
    id: 'actions',
    header: 'Action',
    cell: props => {
      const status = props.row.original.status
      if (status === 'Cleared') return null;
      if (status === 'Blocked') {
         return (
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
            View Details
          </button>
         )
      }
      return (
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
            Investigate
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#EF4444] text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-sm">
            Block Transaction
          </button>
        </div>
      )
    },
  }),
]

// --- Tooltip Styles ---
const customTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)',
  backgroundColor: '#ffffff'
}

const CustomMapTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg">
        <p className="font-bold text-slate-900 mb-1">{data.city}</p>
        <p className={cn("text-xs font-bold", data.type === 'Fraud' ? "text-red-600" : "text-yellow-600")}>
          {data.type}
        </p>
      </div>
    );
  }
  return null;
}

// --- Shared Table Component ---

function DataTable<TData, TValue>({ 
  table, 
  title, 
  icon: Icon, 
  iconColor, 
  iconBg,
  globalFilter,
  setGlobalFilter
}: { 
  table: any, 
  title: string, 
  icon: any, 
  iconColor: string, 
  iconBg: string,
  globalFilter: string,
  setGlobalFilter: (s: string) => void
}) {

  const handleExportCSV = () => {
    const data = table.getCoreRowModel().rows.map((r: any) => r.original);
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row: any) => {
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
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-0 overflow-hidden border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-100 flex flex-col h-full w-full">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          {title}
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search records..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent w-full md:w-[240px]"
            />
          </div>
          <button onClick={handleExportCSV} className="px-4 py-1.5 text-xs font-bold rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-100">
                {headerGroup.headers.map((header: any) => (
                  <th key={header.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
               table.getRowModel().rows.map((row: any) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-sm font-medium text-slate-500">
                  No records found.
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
  )
}

export function RiskFraud() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [riskFilter, setRiskFilter] = React.useState('')
  const [fraudFilter, setFraudFilter] = React.useState('')

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const riskTable = useReactTable({
    data: deliveryRiskData,
    columns: riskColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: riskFilter },
    onGlobalFilterChange: setRiskFilter,
    initialState: {
      pagination: { pageSize: 5 }
    }
  })

  const fraudTable = useReactTable({
    data: fraudAlertData,
    columns: fraudColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: fraudFilter },
    onGlobalFilterChange: setFraudFilter,
    initialState: {
      pagination: { pageSize: 5 }
    }
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ROW 1: Financial & Threat KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Orders at Risk</p>
              <h2 className="text-3xl font-extrabold text-slate-900">{kpiData.ordersAtRisk.toLocaleString('en-US')}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <PackageX className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Predicted late by AI</p>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Revenue at Risk</p>
              <h2 className="text-3xl font-extrabold text-slate-900">${(kpiData.revenueAtRisk / 1000000).toFixed(2)}M</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Total value of delayed orders</p>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Suspected Fraud</p>
              <h2 className="text-3xl font-extrabold text-red-600">{kpiData.suspectedFraud}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Flagged in last 24h</p>
        </Card>

        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Potential Fraud Value</p>
              <h2 className="text-3xl font-extrabold text-slate-900">${(kpiData.fraudValue / 1000).toFixed(1)}k</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Currently under review</p>
        </Card>
      </div>

      {/* ROW 2: Geospatial Threat & Vulnerability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Threat Map (7 spans) */}
        <Card className="p-6 lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
               <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-slate-600" />
              </div>
              Global Threat Map
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Fraud</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Late Risk</span>
            </div>
          </div>
          
          <div className="h-[280px] w-full rounded-xl bg-[#F8FAFC] border border-slate-100 relative overflow-hidden flex items-center justify-center">
            {isMounted ? (
              <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120, center: [0, 20] }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
                <ZoomableGroup zoom={4} center={[-90, 20]} maxZoom={10} minZoom={1} filterZoomEvent={(e: any) => {
                  // Allow scroll zoom or touch zoom
                  return true;
                }}>
                  <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#E2E8F0"
                          stroke="#F8FAFC"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#CBD5E1", outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  {threatMapData.map((entry, index) => (
                    <Marker key={index} coordinates={[entry.lng, entry.lat]}>
                      <circle 
                        r={4} 
                        fill={entry.type === 'Fraud' ? '#EF4444' : '#EAB308'} 
                        fillOpacity={0.8}
                        className="animate-pulse cursor-pointer hover:fill-opacity-100 transition-all duration-300"
                      />
                      <title>{entry.city} - {entry.type} ({entry.z} incidents)</title>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            ) : (
              <div className="w-full h-full bg-slate-100 animate-pulse" />
            )}
          </div>
        </Card>

        {/* Right: Most Targeted Categories (5 spans) */}
        <Card className="p-6 lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                <Target className="w-3 h-3 text-slate-600" />
              </div>
              Most Targeted Categories (Fraud)
            </h3>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudCategoriesData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} width={85} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  formatter={(val: number) => [`${val} Attempts`, 'Fraud Attempts']}
                />
                <Bar dataKey="attempts" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ROW 3: AI Root Cause & Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Feature Importance (4 spans) */}
        <Card className="p-6 lg:col-span-4 flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
             <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
                <BrainCircuit className="w-3 h-3 text-white" />
              </div>
            AI Feature Importance
          </h3>
          <p className="text-xs font-bold text-slate-400 mb-4">Why are orders predicted late?</p>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Impact Weight" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#6366f1', fontWeight: 700 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Risk & Fraud Volume Trend (8 spans) */}
        <Card className="p-6 lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
               <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              Risk & Fraud Volume Trend (14 Days)
            </h3>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} dy={10} tickFormatter={(v) => `D-${v}`} />
                 <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} />
                 <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} />
                 <RechartsTooltip 
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="late" name="Late Risk Orders" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="fraud" name="Fraud Attempts" stroke="#EF4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ROW 4: Operational Action - Logistics */}
      <DataTable 
        table={riskTable} 
        title="Live Late Delivery Risk Predictions" 
        icon={AlertTriangle}
        iconColor="text-[#FF6B00]"
        iconBg="bg-orange-50"
        globalFilter={riskFilter}
        setGlobalFilter={setRiskFilter}
      />

      {/* ROW 5: Security Action - Financial */}
      <DataTable 
        table={fraudTable} 
        title="Fraud Detection & Anomaly Alerts" 
        icon={ShieldAlert}
        iconColor="text-white"
        iconBg="bg-[#EF4444]"
        globalFilter={fraudFilter}
        setGlobalFilter={setFraudFilter}
      />
    </div>
  )
}
