"use client"

import React, { createContext, useContext, useState } from "react"

type GlobalFilters = {
  dateRange: string
  region: string
  category: string
}

type DashboardContextType = {
  filters: GlobalFilters
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>({
    dateRange: "30d",
    region: "global",
    category: "all",
  })

  return (
    <DashboardContext.Provider value={{ filters, setFilters }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
