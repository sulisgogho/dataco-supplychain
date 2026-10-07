"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { AlertCircle, TrendingDown } from "lucide-react"

const deliveryStatusData = [
  { name: "On-Time", value: 65, color: "#16a34a" },
  { name: "Late Delivery", value: 25, color: "#eab308" },
  { name: "Canceled", value: 10, color: "#ef4444" },
]

const leadTimeData = [
  { mode: "Standard", deviation: 4.2 },
  { mode: "First Class", deviation: 1.5 },
  { mode: "Second Class", deviation: 2.8 },
]

const highRiskRegions = [
  { id: 1, city: "Los Angeles", rate: "18.5%", risk: "High", status: "Critical" },
  { id: 2, city: "New York", rate: "14.2%", risk: "High", status: "Warning" },
  { id: 3, city: "Chicago", rate: "11.1%", risk: "Medium", status: "Monitor" },
  { id: 4, city: "Houston", rate: "9.8%", risk: "Medium", status: "Monitor" },
  { id: 5, city: "Miami", rate: "8.4%", risk: "Medium", status: "Monitor" },
]

export function ControlTower() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top row: Financial Impact KPIs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-500">Sales tied up in Late Deliveries</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-400">$1,245,000</div>
            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">Impacts cash flow conversion cycle.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm dark:border-slate-800 bg-red-50/50 dark:bg-red-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-500">Lost Sales (Cancellations)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-400">$312,500</div>
            <p className="text-xs text-red-700/80 dark:text-red-500/80 mt-1">Due to SLA breaches in the last 30 days.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>
              Overall delivery performance breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Lead Time Deviation</CardTitle>
            <CardDescription>
              Average days late by shipping mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="mode" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}d`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc', opacity: 0.1}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#0f172a' }}
                  formatter={(value) => [`${value} days`, "Deviation"]}
                />
                <Bar dataKey="deviation" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-950 dark:border-slate-800">
          <CardHeader>
            <CardTitle>High-Risk Regions (Rute Bermasalah)</CardTitle>
            <CardDescription>
              Cities with highest late delivery risk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Late Rate</TableHead>
                    <TableHead className="text-right">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highRiskRegions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.city}</TableCell>
                      <TableCell>{region.rate}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={region.status === 'Critical' ? 'destructive' : region.status === 'Warning' ? 'warning' : 'secondary'}
                          className={region.status === 'Critical' ? 'bg-red-600' : ''}
                        >
                          {region.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
