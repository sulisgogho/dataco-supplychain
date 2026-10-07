"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { ArrowUpDown, AlertTriangle, Zap, Download } from "lucide-react"

type OrderAlert = {
  id: string
  city: string
  shippingMode: string
  category: string
  lateRisk: number
}

const data: OrderAlert[] = [
  { id: "ORD-7392", city: "Los Angeles", shippingMode: "Standard Class", category: "Electronics", lateRisk: 88 },
  { id: "ORD-7393", city: "New York", shippingMode: "Second Class", category: "Apparel", lateRisk: 92 },
  { id: "ORD-7394", city: "Chicago", shippingMode: "First Class", category: "Toys", lateRisk: 45 },
  { id: "ORD-7395", city: "Houston", shippingMode: "Standard Class", category: "Home & Garden", lateRisk: 67 },
  { id: "ORD-7396", city: "Miami", shippingMode: "Standard Class", category: "Sports", lateRisk: 81 },
  { id: "ORD-7397", city: "Seattle", shippingMode: "Second Class", category: "Electronics", lateRisk: 55 },
  { id: "ORD-7398", city: "Boston", shippingMode: "Standard Class", category: "Apparel", lateRisk: 30 },
  { id: "ORD-7399", city: "Denver", shippingMode: "First Class", category: "Sports", lateRisk: 15 },
]

export const columns: ColumnDef<OrderAlert>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "city",
    header: "Customer City",
  },
  {
    accessorKey: "shippingMode",
    header: "Shipping Mode",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "lateRisk",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Late Risk Probability
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const risk = parseFloat(row.getValue("lateRisk"))
      let variant: "destructive" | "warning" | "success" = "success"
      if (risk > 80) variant = "destructive"
      else if (risk >= 50) variant = "warning"

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant} className="w-16 justify-center">
            {risk}%
          </Badge>
          {risk > 80 && <AlertTriangle className="h-4 w-4 text-red-500" />}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const risk = parseFloat(row.getValue("lateRisk"))
      return (
        <Button 
          variant={risk > 80 ? "default" : "outline"} 
          size="sm" 
          disabled={risk <= 50}
          className={risk > 80 ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Zap className="mr-2 h-3 w-3" />
          Upgrade Shipping
        </Button>
      )
    },
  },
]

export function AlertsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "lateRisk", desc: true }])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Live Risk Alerts</CardTitle>
          <CardDescription>
            Machine learning predictions for today's orders at risk of late delivery.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => console.log("Exporting Late Risk CSV...")}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
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
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
