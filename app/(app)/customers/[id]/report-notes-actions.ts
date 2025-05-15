"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/session"
import { revalidatePath } from "next/cache"

export type ReportNote = {
  id: number
  report_id: number
  content: string
  user_id: number
  user_name: string
  created_at: string
}

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

    const userId = session.user.id
    const companyId = session.user.company_id

    // Validate content
    if (!content.trim()) {
      return { success: false, error: "Note content cannot be empty" }
    }

    // Verify the customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${companyId}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found" }
    }

    // Verify the report belongs to the customer
    const reportCheck = await sql`
      SELECT r.id, r.due_date FROM reports r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ${reportId} 
      AND c.id = ${customerId}
      AND c.company_id = ${companyId}
    `

    if (reportCheck.length === 0) {
      return { success: false, error: "Report not found" }
    }

    // Check if the report is within the 15-day window
    const reportData = reportCheck[0]
    const dueDate = new Date(reportData.due_date)
    const today = new Date()
    const in15Days = new Date()
    in15Days.setDate(today.getDate() + 15)

    // Only allow adding notes if the report is due within 15 days
    if (dueDate > in15Days || dueDate < today) {
      return {
        success: false,
        error: "Notes can only be added for reports due within the next 15 days",
      }
    }

    // Add the note
    await sql`
      INSERT INTO report_notes (report_id, content, user_id)
      VALUES (${reportId}, ${content}, ${userId})
    `

    // Update the report's status_updated_at to track the last activity
    await sql`
      UPDATE reports
      SET status_updated_at = NOW()
      WHERE id = ${reportId}
    `

    // Revalidate the page to show the new note
    revalidatePath(`/customers/${customerId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding report note:", error)
    return { success: false, error: "Failed to add note" }
  }
}

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

    const companyId = session.user.company_id

    // Verify the customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${companyId}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found" }
    }

    // Verify the report belongs to the customer
    const reportCheck = await sql`
      SELECT r.id, r.due_date FROM reports r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ${reportId} 
      AND c.id = ${customerId}
      AND c.company_id = ${companyId}
    `

    if (reportCheck.length === 0) {
      return { success: false, error: "Report not found" }
    }

    // Check if the report is within the 15-day window
    const reportData = reportCheck[0]
    const dueDate = new Date(reportData.due_date)
    const today = new Date()
    const in15Days = new Date()
    in15Days.setDate(today.getDate() + 15)

    // If the report is outside the 15-day window, clear the notes
    if (dueDate > in15Days || dueDate < today) {
      // We don't actually delete the notes, but we return an empty array
      // This way we preserve the history but don't show it in the UI
      return { success: true, notes: [] }
    }

    // Get the notes with user information
    const notes = await sql`
      SELECT rn.id, rn.report_id, rn.content, rn.user_id, 
             u.first_name || ' ' || u.last_name as user_name,
             rn.created_at
      FROM report_notes rn
      JOIN users u ON rn.user_id = u.id
      WHERE rn.report_id = ${reportId}
      ORDER BY rn.created_at DESC
    `

    return { success: true, notes }
  } catch (error) {
    console.error("Error getting report notes:", error)
    return { success: false, error: "Failed to get notes" }
  }
}

// New function to get the last note for a report
export async function getLastReportNote(
  reportId: number,
): Promise<{ success: boolean; note?: string; error?: string }> {
  try {
    // Get the last note for the report
    const notes = await sql`
      SELECT content
      FROM report_notes
      WHERE report_id = ${reportId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (notes.length === 0) {
      return { success: true, note: "" }
    }

    return { success: true, note: notes[0].content }
  } catch (error) {
    console.error("Error getting last report note:", error)
    return { success: false, error: "Failed to get last note" }
  }
}
