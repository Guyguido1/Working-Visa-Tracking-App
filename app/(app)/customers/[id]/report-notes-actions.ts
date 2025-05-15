"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"

export type ReportNote = {
  id: number
  report_id: number
  content: string
  user_id: number
  user_name?: string
  created_at: string
}

/**
 * Add a new note to a report
 */
export async function addReportNote(
  reportId: number,
  customerId: number,
  content: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the user's session to access their user_id and company_id
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

    // Add the note
    await sql`
      INSERT INTO report_notes (report_id, content, user_id)
      VALUES (${reportId}, ${content}, ${session.user_id})
    `

    // Revalidate paths
    revalidatePath(`/customers/${customerId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error adding report note:", error)
    return { success: false, error: "Failed to add report note" }
  }
}

/**
 * Get all notes for a report
 */
export async function getReportNotes(
  reportId: number,
  customerId: number,
): Promise<{ success: boolean; notes?: ReportNote[]; error?: string }> {
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

    // Get the notes with user information
    const notes = await sql`
      SELECT rn.id, rn.report_id, rn.content, rn.user_id, rn.created_at,
             u.name as user_name
      FROM report_notes rn
      JOIN users u ON rn.user_id = u.id
      WHERE rn.report_id = ${reportId}
      ORDER BY rn.created_at DESC
    `

    return {
      success: true,
      notes: notes as ReportNote[],
    }
  } catch (error) {
    console.error("Error getting report notes:", error)
    return { success: false, error: "Failed to get report notes" }
  }
}
