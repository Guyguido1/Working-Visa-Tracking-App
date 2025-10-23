"use client"

import { useEffect, type ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Set theme on mount
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  return <>{children}</>
}
