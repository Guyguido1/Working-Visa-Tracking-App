"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"
import { updateReportStatus, getReportWithStatus } from "@/lib/db"
import { REPORT_STATUSES, type ReportStatus, type ReportStatusResponse } from "./report-constants"

/**
 * Updates the status and optional note for a customer report
 */
export async function updateCustomerReportStatus(
  reportId: number,
  customerId: number,
  status: ReportStatus,
  note?: string,
): Promise<ReportStatusResponse> {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate status
    if (!Object.values(REPORT_STATUSES).includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${Object.values(REPORT_STATUSES).join(", ")}`,
      }
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

    // Get the updated report
    const updatedReport = await getReportWithStatus(reportId)

    if (!updatedReport || updatedReport.length === 0) {
      return { success: true }
    }

    // Revalidate paths
    revalidatePath(`/customers/${customerId}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      report: {
        id: updatedReport[0].id,
        status: updatedReport[0].status,
        note: updatedReport[0].note,
        status_updated_at: updatedReport[0].status_updated_at,
      },
    }
  } catch (error) {
    console.error("Error updating report status:", error)
    return { success: false, error: "Failed to update report status" }
  }
}

/**
 * Gets the current status and note for a report
 */
export async function getReportStatus(reportId: number, customerId: number): Promise<ReportStatusResponse> {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify this customer belongs to the user's company
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

    // Get the report
    const report = await getReportWithStatus(reportId)

    if (!report || report.length === 0) {
      return { success: false, error: "Report not found" }
    }

    return {
      success: true,
      report: {
        id: report[0].id,
        status: report[0].status,
        note: report[0].note,
        status_updated_at: report[0].status_updated_at,
      },
    }
  } catch (error) {
    console.error("Error getting report status:", error)
    return { success: false, error: "Failed to get report status" }
  }
}
