"use client"

import * as React from "react"
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper 
} from "@tanstack/react-table"
import { Search, Download, Database, ChevronLeft, ChevronRight } from "lucide-react"

export default function DatasetClient({ data }: { data: Record<string, string>[] }) {
  const [globalFilter, setGlobalFilter] = React.useState('')
  
  // Dynamically generate columns based on the keys of the first row
  const columns = React.useMemo(() => {
    if (!data || data.length === 0) return []
    const columnHelper = createColumnHelper<Record<string, string>>()
    return Object.keys(data[0]).map(key => 
      columnHelper.accessor(key, {
        header: key,
        cell: info => <span className="text-slate-600 font-medium whitespace-nowrap">{info.getValue() || '-'}</span>,
      })
    )
  }, [data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 12 } }
  })

  return (
    <div className="flex flex-col gap-6 p-8 w-full max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-white" />
            </div>
            Master Dataset
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Showing a preview of {data.length} real records from DataCoSupplyChainDataset.csv (All {columns.length} Variables)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search dataset..." 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-[260px] shadow-sm"
            />
          </div>
          
          <a 
            href="/DataCoSupplyChainDataset.csv"
            download
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Full CSV (95MB)
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-r border-slate-100 last:border-r-0">
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                      <td key={cell.id} className="px-4 py-3 text-sm whitespace-nowrap border-r border-slate-50 last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                    No records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white mt-auto">
          <span className="text-xs font-bold text-slate-500">
            Showing Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({data.length} preview records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
