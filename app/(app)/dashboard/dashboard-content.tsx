"use client"

import { useState } from "react"
import { Users, Calendar, Clock, AlertTriangle, FileText, Cake, Edit } from "lucide-react"
import StatCard from "@/components/stat-card"
import type { CustomerWithReport } from "../../actions/dashboard"
import { format } from "date-fns"
import Link from "next/link"

type DashboardContentProps = {
  counts: {
    totalCustomers: number
    visaReportNotDue: number
    reportsDue15Days: number
    visaExpiring30Days: number
    passportExpiring30Days: number
    birthdays: number
  }
  categories: {
    allCustomers: CustomerWithReport[]
    visaReportNotDue: CustomerWithReport[]
    reportsDue15Days: CustomerWithReport[]
    visaExpiring30Days: CustomerWithReport[]
    passportExpiring30Days: CustomerWithReport[]
    birthdays: CustomerWithReport[]
  }
}

type CategoryKey =
  | "allCustomers"
  | "visaReportNotDue"
  | "reportsDue15Days"
  | "visaExpiring30Days"
  | "passportExpiring30Days"
  | "birthdays"

// Helper function to safely format dates
const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return "N/A"

  try {
    // Convert string to Date if it's not already a Date object
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
    return format(date, "dd/MM/yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return String(dateValue) || "N/A"
  }
}

export default function DashboardContent({ counts, categories }: DashboardContentProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("allCustomers")

  // Add runtime guards to check for invalid data
  if (!counts || typeof counts !== "object") {
    console.error("Invalid counts object:", counts)
    return <div className="p-4 bg-red-50 rounded-lg">Error loading dashboard data: Invalid counts object</div>
  }

  // Check if counts is an error object
  if ("success" in counts && "name" in counts && !counts.success) {
    console.error("Error object received in counts:", counts)
    return <div className="p-4 bg-red-50 rounded-lg">Error loading dashboard: {counts.name}</div>
  }

  // Check if categories is valid
  if (!categories || typeof categories !== "object") {
    console.error("Invalid categories object:", categories)
    return <div className="p-4 bg-red-50 rounded-lg">Error loading dashboard data: Invalid categories object</div>
  }

  // Check if categories is an error object
  if ("success" in categories && "name" in categories && !categories.success) {
    console.error("Error object received in categories:", categories)
    return <div className="p-4 bg-red-50 rounded-lg">Error loading dashboard: {categories.name}</div>
  }

  const statCards = [
    {
      key: "allCustomers",
      title: "Total Customers",
      value: counts.totalCustomers,
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-600 text-white",
    },
    {
      key: "visaReportNotDue",
      title: "Visa/Report Not Due",
      value: counts.visaReportNotDue,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-green-600 text-white",
    },
    {
      key: "reportsDue15Days",
      title: "Reports Due in 15 Days",
      value: counts.reportsDue15Days,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-amber-500 text-white",
    },
    {
      key: "visaExpiring30Days",
      title: "Visa Expiring <30 days",
      value: counts.visaExpiring30Days,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "bg-red-600 text-white",
    },
    {
      key: "passportExpiring30Days",
      title: "Passport Expiring <30 days",
      value: counts.passportExpiring30Days,
      icon: <FileText className="w-5 h-5" />,
      color: "bg-purple-600 text-white",
    },
    {
      key: "birthdays",
      title: "Today & Tomorrow's Birthdays",
      value: counts.birthdays,
      icon: <Cake className="w-5 h-5" />,
      color: "bg-pink-500 text-white",
    },
  ]

  // Get category title for display
  const getCategoryTitle = () => {
    const card = statCards.find((card) => card.key === activeCategory)
    return card ? card.title : "Customers"
  }

  // Get customers for the active category
  const getActiveCustomers = () => {
    // Add safety check for categories[activeCategory]
    if (!categories[activeCategory]) {
      console.error(`Category ${activeCategory} not found in categories:`, categories)
      return []
    }
    return categories[activeCategory]
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            onClick={() => setActiveCategory(card.key as CategoryKey)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={activeCategory === card.key ? `${card.color} ring-4 ring-offset-2 ring-blue-300` : card.color}
            />
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">{getCategoryTitle()} List</h2>
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Visa Type</th>
                    <th>Visa Expiry</th>
                    <th>Report Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getActiveCustomers().length > 0 ? (
                    getActiveCustomers().map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <Link
                            href={`/customers/${customer.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {customer.first_name} {customer.last_name}
                          </Link>
                        </td>
                        <td>{customer.email || "N/A"}</td>
                        <td>{customer.visa_type || "N/A"}</td>
                        <td>{formatDate(customer.expiry_date)}</td>
                        <td>{formatDate(customer.report?.due_date)}</td>
                        <td>
                          <Link
                            href={`/edit-customer/${customer.id}`}
                            className="btn btn-ghost btn-sm"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No customers in this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
