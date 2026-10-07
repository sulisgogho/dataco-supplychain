"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type FraudAlert = {
  id: string
  paymentType: "TRANSFER" | "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL"
  location: string
  anomalyScore: number
}

const data: FraudAlert[] = [
  { id: "TXN-90214", paymentType: "TRANSFER", location: "Southeast Asia", anomalyScore: 98 },
  { id: "TXN-11394", paymentType: "TRANSFER", location: "Eastern Europe", anomalyScore: 92 },
  { id: "TXN-49210", paymentType: "CREDIT_CARD", location: "North America", anomalyScore: 78 },
  { id: "TXN-88219", paymentType: "TRANSFER", location: "South America", anomalyScore: 88 },
  { id: "TXN-55102", paymentType: "PAYPAL", location: "Western Europe", anomalyScore: 65 },
]

export const columns: ColumnDef<FraudAlert>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "paymentType",
    header: "Payment Type",
    cell: ({ row }) => {
      const type = row.getValue("paymentType") as string
      return type === "TRANSFER" ? (
        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-100">{type}</Badge>
      ) : (
        <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{type}</Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Market Location",
    cell: ({ row }) => <div>{row.getValue("location")}</div>,
  },
  {
    accessorKey: "anomalyScore",
    header: () => <div className="text-right">Anomaly Score</div>,
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("anomalyScore"))
      let colorClass = "text-amber-600 dark:text-amber-400"
      if (score >= 90) colorClass = "text-red-600 dark:text-red-400 font-bold"
      
      return <div className={`text-right ${colorClass}`}>{score}%</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: () => {
      return (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Investigate
          </Button>
          <Button size="sm" className="h-8 bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-red-600 dark:hover:bg-red-700">
            Block
          </Button>
        </div>
      )
    },
  },
]

export function FraudTable() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "anomalyScore", desc: true }])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <Card className="border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-red-600 dark:text-red-400">Fraud Detection Alerts</CardTitle>
          <CardDescription>AI-flagged anomalous transactions requiring immediate review.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => console.log("Exporting Fraud CSV...")}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
