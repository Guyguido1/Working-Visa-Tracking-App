"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"
import { updateReportStatus } from "@/lib/db"

export async function updateCustomerReportStatus(reportId: number, customerId: number, status: string, note?: string) {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // First verify this customer belongs to the user's company
    const customerCheck = await sql`
      SELECT c.id FROM customers c
      JOIN reports r ON r.customer_id = c.id
      WHERE r.id = ${reportId} 
      AND c.id = ${customerId}
      AND c.company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Report not found or access denied" }
    }

    // Update the report status
    await updateReportStatus(reportId, {
      status,
      note,
    })

    // Revalidate paths
    revalidatePath(`/customers/${customerId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error updating report status:", error)
    return { success: false, error: "Failed to update report status" }
  }
}
