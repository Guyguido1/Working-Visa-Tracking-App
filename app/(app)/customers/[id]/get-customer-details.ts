"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/session"

export type CustomerDetails = {
  customer: {
    id: number
    company_id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    passport_number: string
    nationality: string
    visa_type: string
    expiry_date: string | null
    application_date: string | null
    date_of_birth: string | null
    passport_expiry_date: string | null
    created_at: string
    updated_at: string
  }
  report: {
    id: number
    customer_id: number
    title: string
    description: string
    due_date: string
    status: string
    note: string | null
    status_updated_at: string | null
    created_at: string
    updated_at: string
  } | null
  notes: Array<{
    id: number
    customer_id: number
    content: string
    created_at: string
    updated_at: string
  }>
  files: Array<{
    id: number
    customer_id: number
    filename: string
    file_type: string
    file_path: string
    created_at: string
    updated_at: string
  }>
}

export async function getCustomerDetailsWithReport(customerId: number): Promise<{
  success: boolean
  data?: CustomerDetails
  error?: string
}> {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Get customer data with company_id check
    const customerResult = await sql`
      SELECT * FROM customers 
      WHERE id = ${customerId} AND company_id = ${session.company_id}
    `

    if (customerResult.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // Get associated report if any
    const reportResult = await sql`
      SELECT * FROM reports 
      WHERE customer_id = ${customerId}
      ORDER BY due_date DESC
      LIMIT 1
    `

    // Get notes
    const notesResult = await sql`
      SELECT * FROM customer_notes
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `

    // Get files
    const filesResult = await sql`
      SELECT * FROM customer_files
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `

    // Format dates for consistency
    const formatDate = (date: Date | null | undefined): string | null => {
      if (!date) return null
      return new Date(date).toISOString()
    }

    // Process customer data
    const customer = {
      ...customerResult[0],
      expiry_date: formatDate(customerResult[0].expiry_date),
      application_date: formatDate(customerResult[0].application_date),
      date_of_birth: formatDate(customerResult[0].date_of_birth),
      passport_expiry_date: formatDate(customerResult[0].passport_expiry_date),
      created_at: formatDate(customerResult[0].created_at) || "",
      updated_at: formatDate(customerResult[0].updated_at) || "",
    }

    // Process report data if exists
    const report =
      reportResult.length > 0
        ? {
            ...reportResult[0],
            due_date: formatDate(reportResult[0].due_date) || "",
            status_updated_at: formatDate(reportResult[0].status_updated_at),
            created_at: formatDate(reportResult[0].created_at) || "",
            updated_at: formatDate(reportResult[0].updated_at) || "",
          }
        : null

    // Process notes
    const notes = notesResult.map((note) => ({
      ...note,
      created_at: formatDate(note.created_at) || "",
      updated_at: formatDate(note.updated_at) || "",
    }))

    // Process files
    const files = filesResult.map((file) => ({
      ...file,
      created_at: formatDate(file.created_at) || "",
      updated_at: formatDate(file.updated_at) || "",
    }))

    return {
      success: true,
      data: {
        customer,
        report,
        notes,
        files,
      },
    }
  } catch (error) {
    console.error("Error fetching customer details:", error)
    return { success: false, error: "Failed to fetch customer details" }
  }
}
