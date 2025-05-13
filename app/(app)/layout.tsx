"use client"

import type React from "react"
import Sidebar from "@/components/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-base-100 min-h-screen flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
