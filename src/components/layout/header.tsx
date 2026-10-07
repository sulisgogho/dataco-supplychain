"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Mail, Settings, LayoutDashboard, Truck, PackageSearch, AlertTriangle } from "lucide-react"
import { useDashboard } from "@/components/dashboard-provider"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Logistics", href: "/control-tower", icon: Truck },
  { name: "Sales", href: "/sales-inventory", icon: PackageSearch },
  { name: "Risk", href: "/risk-fraud", icon: AlertTriangle },
]

export function Header() {
  const { filters, setFilters } = useDashboard()
  const pathname = usePathname()

  return (
    <>
      <header className="relative flex h-16 md:h-20 shrink-0 items-center gap-4 md:gap-8 bg-white px-4 md:px-8 border-b border-slate-100">
      <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tight shrink-0">
        <div className="bg-[#FF6B00] p-1.5 rounded-lg">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <span className="text-[18px]">DataCo Supply Chain</span>
      </div>

      <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all duration-300",
                isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center justify-end shrink-0 ml-auto">
        <Link 
          href="/dataset"
          className="flex items-center gap-2 h-9 md:h-10 px-3 md:px-4 rounded-full bg-slate-900 text-white text-[12px] md:text-[13px] font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table">
            <path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>
          </svg>
          Master Dataset
        </Link>
      </div>

    </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-between pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 w-16",
                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-900"
              )}
            >
              <div className={cn("p-1.5 rounded-full transition-colors", isActive ? "bg-slate-900 text-white shadow-sm" : "bg-transparent")}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              </div>
              <span className={cn("text-[10px] font-bold", isActive ? "text-slate-900" : "text-slate-400")}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
