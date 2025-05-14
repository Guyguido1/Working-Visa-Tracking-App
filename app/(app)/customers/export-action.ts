"use server"

import { sql } from "@/lib/db"
import { getCompanyIdFromSession } from "@/lib/auth"

export async function exportCustomers() {
  try {
    const companyId = await getCompanyIdFromSession()

    if (!companyId) {
      throw new Error("Unauthorized")
    }

    // Get all customers for the company with all fields from the database
    const customers = await sql`
      SELECT 
        id, 
        company_id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        date_of_birth, 
        passport_number, 
        passport_expiry_date, 
        nationality, 
        visa_type, 
        expiry_date, 
        application_date, 
        created_at, 
        updated_at
      FROM customers 
      WHERE company_id = ${companyId}
      ORDER BY last_name, first_name
    `

    // Create CSV header row using database column names
    const headers = [
      "id",
      "company_id",
      "first_name",
      "last_name",
      "email",
      "phone",
      "date_of_birth",
      "passport_number",
      "passport_expiry_date",
      "nationality",
      "visa_type",
      "expiry_date",
      "application_date",
      "created_at",
      "updated_at",
    ]

    // Create CSV content
    let csvContent = headers.join(",") + "\n"

    // Add data rows
    customers.forEach((customer) => {
      const row = headers.map((header) => {
        const value = customer[header]

        // Handle null values
        if (value === null || value === undefined) {
          return ""
        }

        // Format dates as ISO strings
        if (value instanceof Date) {
          return value.toISOString()
        }

        // Escape commas and quotes in string values
        if (typeof value === "string") {
          // If the value contains commas or quotes, wrap it in quotes and escape any quotes
          if (value.includes(",") || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }

        return String(value)
      })

      csvContent += row.join(",") + "\n"
    })

    // Return the CSV content
    return { success: true, csvContent, filename: `customers-export-${new Date().toISOString().split("T")[0]}.csv` }
  } catch (error) {
    console.error("Error exporting customers:", error)
    return { success: false, error: "Failed to export customers" }
  }
}
