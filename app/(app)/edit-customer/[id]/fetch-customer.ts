"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/session"

export async function fetchCustomerById(id: number) {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Get customer data with company_id check
    const customerResult = await sql`
      SELECT * FROM customers 
      WHERE id = ${id} AND company_id = ${session.company_id}
    `

    if (customerResult.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // Get associated report if any
    const reportResult = await sql`
      SELECT r.* FROM reports r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.customer_id = ${id}
      AND c.company_id = ${session.company_id}
      ORDER BY r.due_date DESC
      LIMIT 1
    `

    return {
      success: true,
      customer: customerResult[0],
      report: reportResult.length > 0 ? reportResult[0] : null,
    }
  } catch (error) {
    console.error("Error fetching customer:", error)
    return { success: false, error: "Failed to fetch customer data" }
  }
}
