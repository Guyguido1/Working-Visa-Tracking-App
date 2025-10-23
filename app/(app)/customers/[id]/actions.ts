"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"

export type Note = {
  id: number
  customer_id: number
  user_id: number
  content: string
  created_at: string
  company_id: number
  user_email: string
  isOptimistic?: boolean
}

export type CustomerFile = {
  id: number
  customer_id: number
  filename: string
  file_type: string
  file_path: string
  created_at: string
}

export async function addNote(customerId: number, content: string) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  try {
    await sql`
      INSERT INTO customer_notes (customer_id, user_id, content, company_id)
      VALUES (${customerId}, ${session.user_id}, ${content}, ${session.company_id})
    `

    revalidatePath(`/customers/${customerId}`)
    return { success: true }
  } catch (error) {
    console.error("Add note error:", error)
    return { success: false, error: "Failed to add note" }
  }
}

export async function deleteNote(noteId: number, customerId: number) {
  // ✅ TENANT ISOLATION: Get user's company_id from session
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    if (!Number.isInteger(noteId) || noteId <= 0) {
      console.error("Invalid note ID:", noteId)
      return { success: false, error: "Invalid note ID" }
    }

    // ✅ TENANT ISOLATION: Verify note belongs to customer in user's company
    const customerCheck = await sql`
      SELECT c.id FROM customers c
      JOIN customer_notes n ON n.customer_id = c.id
      WHERE n.id = ${noteId} AND c.company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Note not found or access denied" }
    }

    await sql`
      DELETE FROM customer_notes
      WHERE id = ${noteId}
    `
    revalidatePath(`/customers/${customerId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting note:", error)
    return { success: false, error: "Failed to delete note" }
  }
}

export async function uploadFile(customerId: number, file: File) {
  // ✅ TENANT ISOLATION: Get user's company_id from session
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // ✅ TENANT ISOLATION: Verify customer belongs to user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    const filename = file.name
    const fileType = file.type
    const filePath = `/uploads/${customerId}/${Date.now()}-${filename}`

    await sql`
      INSERT INTO customer_files (customer_id, filename, file_type, file_path, company_id)
      VALUES (${customerId}, ${filename}, ${fileType}, ${filePath}, ${session.company_id})
    `

    revalidatePath(`/customers/${customerId}`)
    return { success: true, filePath }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 500): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (retries >= maxRetries) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Too Many Requests")) {
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        retries++
        delay *= 2
      } else {
        throw error
      }
    }
  }
}

export async function getCustomerDetails(customerId: number) {
  // ✅ TENANT ISOLATION: Get user's company_id from session
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const customerData = await retryWithBackoff(async () => {
      try {
        // ✅ TENANT ISOLATION: Filter by company_id
        const customerResult = await sql`
          SELECT * FROM customers 
          WHERE id = ${customerId} AND company_id = ${session.company_id}
        `

        if (customerResult.length === 0) {
          return { customer: null }
        }

        return { customer: customerResult[0] }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

    if (!customerData.customer) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // ✅ TENANT ISOLATION: Reports are filtered through customer's company_id
    const reportData = await retryWithBackoff(async () => {
      try {
        const reportResult = await sql`
          SELECT r.* FROM reports r
          JOIN customers c ON r.customer_id = c.id
          WHERE r.customer_id = ${customerId}
          AND c.company_id = ${session.company_id}
          ORDER BY r.due_date DESC
          LIMIT 1
        `
        return reportResult.length > 0 ? reportResult[0] : null
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

    // ✅ TENANT ISOLATION: Notes are filtered through customer's company_id
    const notesData = await retryWithBackoff(async () => {
      try {
        const notesResult = await sql`
          SELECT cn.*, u.email as user_email
          FROM customer_notes cn
          JOIN users u ON cn.user_id = u.id
          WHERE cn.customer_id = ${customerId}
          AND cn.company_id = ${session.company_id}
          ORDER BY cn.created_at DESC
        `
        return notesResult.rows
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

    // ✅ TENANT ISOLATION: Files are filtered through customer's company_id
    const filesData = await retryWithBackoff(async () => {
      try {
        const filesResult = await sql`
          SELECT f.* FROM customer_files f
          JOIN customers c ON f.customer_id = c.id
          WHERE f.customer_id = ${customerId}
          AND c.company_id = ${session.company_id}
          ORDER BY f.created_at DESC
        `
        return filesResult
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

    return {
      success: true,
      customer: customerData.customer,
      report: reportData,
      notes: notesData,
      files: filesData,
    }
  } catch (error) {
    console.error("Error fetching customer details:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("Too Many Requests")) {
      return {
        success: false,
        error: "The database is currently experiencing high traffic. Please try again in a few moments.",
      }
    }

    return { success: false, error: "Failed to fetch customer details" }
  }
}

export async function updateReportStatus(reportId: number, status: string) {
  try {
    const session = await getSession()
    if (!session) {
      throw new Error("Unauthorized")
    }

    await sql`
      UPDATE reports 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${reportId}
    `

    revalidatePath(`/customers`)
    return { success: true }
  } catch (error) {
    console.error("Error updating report status:", error)
    return { success: false, error: "Failed to update report status" }
  }
}

export async function addReportNote(reportId: number, note: string) {
  try {
    const session = await getSession()
    if (!session) {
      throw new Error("Unauthorized")
    }

    await sql`
      UPDATE reports 
      SET note = ${note}, updated_at = NOW()
      WHERE id = ${reportId}
    `

    revalidatePath(`/customers`)
    return { success: true }
  } catch (error) {
    console.error("Error adding report note:", error)
    return { success: false, error: "Failed to add report note" }
  }
}
