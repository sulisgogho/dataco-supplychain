"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, Truck, Settings, AlertTriangle, Search, User, PackageSearch } from "lucide-react"

const navigation = [
  { name: "Executive Overview", href: "/", icon: LayoutDashboard },
  { name: "Logistics & Delivery", href: "/control-tower", icon: Truck },
  { name: "Sales & Inventory", href: "/sales-inventory", icon: PackageSearch },
  { name: "Risk & Fraud (AI Mode)", href: "/risk-fraud", icon: AlertTriangle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-[calc(100vh-32px)] w-64 flex-col m-4 mr-0 rounded-[24px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-[17px]">DataCo Logistics</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
