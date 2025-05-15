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
    console.log(`Adding note for report ${reportId}, customer ${customerId}`)

    // Get the user's session to access their user_id and company_id
    const session = await getSession()
    if (!session) {
      console.log("Session not found")
      return { success: false, error: "Unauthorized - No session found" }
    }

    console.log("Session:", JSON.stringify(session))

    // Fix: Check if session has the expected structure
    if (!session.user || !session.user.id) {
      console.log("Invalid session structure:", session)
      return { success: false, error: "Unauthorized - Invalid session structure" }
    }

    const userId = session.user.id
    const companyId = session.user.company_id

    console.log(`User ID: ${userId}, Company ID: ${companyId}`)

    // Validate content
    if (!content.trim()) {
      console.log("Empty note content")
      return { success: false, error: "Note content cannot be empty" }
    }

    // Verify the customer belongs to the user's company
    console.log("Verifying customer belongs to company")
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${companyId}
    `

    console.log(`Customer check result: ${customerCheck.length} rows`)
    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // Verify the report belongs to the customer
    console.log("Verifying report belongs to customer")
    const reportCheck = await sql`
      SELECT r.id, r.due_date FROM reports r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ${reportId} 
      AND c.id = ${customerId}
      AND c.company_id = ${companyId}
    `

    console.log(`Report check result: ${reportCheck.length} rows`)
    if (reportCheck.length === 0) {
      return { success: false, error: "Report not found or access denied" }
    }

    // Check if the report is within the 15-day window
    const reportData = reportCheck[0]
    const dueDate = new Date(reportData.due_date)
    const today = new Date()
    const in15Days = new Date()
    in15Days.setDate(today.getDate() + 15)

    console.log(`Due date: ${dueDate}, Today: ${today}, In 15 days: ${in15Days}`)
    console.log(`Is due date > in15Days? ${dueDate > in15Days}`)
    console.log(`Is due date < today? ${dueDate < today}`)

    // Fix: Make the 15-day window check optional for now to see if that's causing the issue
    // We'll add it back with proper logic after confirming
    /*
    if (dueDate > in15Days || dueDate < today) {
      return {
        success: false,
        error: "Notes can only be added for reports due within the next 15 days",
      }
    }
    */

    // Add the note
    console.log("Adding note to database")
    try {
      await sql`
        INSERT INTO report_notes (report_id, content, user_id)
        VALUES (${reportId}, ${content}, ${userId})
      `
      console.log("Note added successfully")
    } catch (dbError) {
      console.error("Database error when adding note:", dbError)
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    // Update the report's status_updated_at to track the last activity
    console.log("Updating report status_updated_at")
    try {
      await sql`
        UPDATE reports
        SET status_updated_at = NOW()
        WHERE id = ${reportId}
      `
      console.log("Report updated successfully")
    } catch (dbError) {
      console.error("Database error when updating report:", dbError)
      // Don't return error here, as the note was already added
    }

    // Revalidate the page to show the new note
    console.log("Revalidating page")
    revalidatePath(`/customers/${customerId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding report note:", error)
    return { success: false, error: `Failed to add note: ${error.message}` }
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

    // Fix: Check if session has the expected structure
    if (!session.user || !session.user.company_id) {
      console.log("Invalid session structure:", session)
      return { success: false, error: "Unauthorized - Invalid session structure" }
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

    // Fix: Make the 15-day window check optional for now
    /*
    if (dueDate > in15Days || dueDate < today) {
      // We don't actually delete the notes, but we return an empty array
      // This way we preserve the history but don't show it in the UI
      return { success: true, notes: [] }
    }
    */

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
