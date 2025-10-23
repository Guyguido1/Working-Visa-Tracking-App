"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"

export type Note = {
  id: number
  customer_id: number
  content: string
  created_at: string
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
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // First verify this customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    const result = await sql`
      INSERT INTO customer_notes (customer_id, content)
      VALUES (${customerId}, ${content})
      RETURNING id
    `

    // Return the new note ID
    const noteId = result[0]?.id

    revalidatePath(`/customers/${customerId}`)
    return { success: true, noteId }
  } catch (error) {
    console.error("Error adding note:", error)
    return { success: false, error: "Failed to add note" }
  }
}

export async function deleteNote(noteId: number, customerId: number) {
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Validate that noteId is a valid integer
    if (!Number.isInteger(noteId) || noteId <= 0) {
      console.error("Invalid note ID:", noteId)
      return { success: false, error: "Invalid note ID" }
    }

    // First verify this customer belongs to the user's company
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
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // First verify this customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // In a real app, you would upload the file to storage and save the path
    // For this demo, we'll simulate file upload by just storing metadata
    const filename = file.name
    const fileType = file.type

    // Simulate file path (in a real app, this would be the actual storage path)
    const filePath = `/uploads/${customerId}/${Date.now()}-${filename}`

    await sql`
      INSERT INTO customer_files (customer_id, filename, file_type, file_path)
      VALUES (${customerId}, ${filename}, ${fileType}, ${filePath})
    `

    revalidatePath(`/customers/${customerId}`)
    return { success: true, filePath }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

// Helper function to implement retry logic with exponential backoff
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

      // Check if it's a rate limit error (Too Many Requests)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Too Many Requests")) {
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retries + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        retries++
        delay *= 2 // Exponential backoff
      } else {
        // If it's not a rate limit error, rethrow
        throw error
      }
    }
  }
}

export async function getCustomerDetails(customerId: number) {
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Use retry logic for database queries
    const customerData = await retryWithBackoff(async () => {
      try {
        // Get customer data with company_id check
        const customerResult = await sql`
          SELECT * FROM customers 
          WHERE id = ${customerId} AND company_id = ${session.company_id}
        `

        if (customerResult.length === 0) {
          return { customer: null }
        }

        return { customer: customerResult[0] }
      } catch (error) {
        // Handle potential non-JSON responses
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

    // If customer not found, return error
    if (!customerData.customer) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // Get other data with separate retries to avoid overwhelming the database
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

    const notesData = await retryWithBackoff(async () => {
      try {
        const notesResult = await sql`
          SELECT n.* FROM customer_notes n
          JOIN customers c ON n.customer_id = c.id
          WHERE n.customer_id = ${customerId}
          AND c.company_id = ${session.company_id}
          ORDER BY n.created_at DESC
        `
        return notesResult
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many R")) {
          throw new Error("Too Many Requests - Rate limit exceeded")
        }
        throw error
      }
    })

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

    // Provide a more user-friendly error message for rate limiting
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
