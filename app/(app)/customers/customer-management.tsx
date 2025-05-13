"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Edit } from "lucide-react"
import type { CustomerWithReport } from "../../actions/dashboard"
import { format } from "date-fns"

type CustomerManagementProps = {
  customers: CustomerWithReport[]
}

export default function CustomerManagement({ customers }: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers

    const query = searchQuery.toLowerCase().trim()
    return customers.filter((customer) => {
      // Check if first name begins with query
      if (customer.first_name.toLowerCase().startsWith(query)) return true

      // Check if last name begins with query
      if (customer.last_name.toLowerCase().startsWith(query)) return true

      // Check if full name begins with query
      if (`${customer.first_name} ${customer.last_name}`.toLowerCase().startsWith(query)) return true

      // Check if passport number begins with query
      if (customer.passport_number && customer.passport_number.toLowerCase().startsWith(query)) return true

      return false
    })
  }, [customers, searchQuery])

  // Helper function to safely format dates
  const formatDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) return "N/A"

    try {
      // Convert string to Date if it's not already a Date object
      const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
      return format(new Date(date), "dd/MM/yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return String(dateValue) || "N/A"
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Customer Management</h1>

      {/* Search Bar */}
      <div className="card bg-base-200 shadow-xl mb-8">
        <div className="card-body">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              placeholder="Search by name or passport number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Passport Number</th>
                  <th>Visa Type</th>
                  <th>Visa Expiry</th>
                  <th>Report Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
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
                      <td>{customer.passport_number || "N/A"}</td>
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
                    <td colSpan={7} className="text-center py-4">
                      {searchQuery ? "No customers match your search" : "No customers found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
