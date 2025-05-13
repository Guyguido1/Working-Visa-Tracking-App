"use server"

import { updateCustomer, updateReport, createReport, deleteReport } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"
import { sql } from "@/lib/db"

// Helper function to safely execute database operations with retry logic
async function safeDbOperation<T>(
  operation: () => Promise<T>,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await operation()
    return { success: true, data: result }
  } catch (error) {
    console.error("Database operation error:", error)

    // Check for rate limit errors in various formats
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("Too Many R") ||
      (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many"))
    ) {
      return {
        success: false,
        error: "The database is currently experiencing high traffic. Please try again in a few moments.",
      }
    }

    return { success: false, error: "Database operation failed. Please try again." }
  }
}

// Helper function to ensure date strings are properly formatted for Postgres DATE type
function formatDateForDB(dateStr: string | null): string | null {
  if (!dateStr) return null

  try {
    // Parse the date string to ensure it's valid
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      console.error("Invalid date string for DB:", dateStr)
      return null
    }

    // Format as YYYY-MM-DD without any timezone conversion
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date for DB:", error)
    return null
  }
}

export async function updateCustomerAction(id: number, formData: FormData) {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // First verify this customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${id} AND company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const nationality = formData.get("nationality") as string
    const passportNumber = formData.get("passportNumber") as string
    const passportExpiryDate = formData.get("passportExpiryDate") as string
    const visaType = formData.get("visaType") as string
    const visaExpiryDate = formData.get("visaExpiryDate") as string
    const lastReportDate = formData.get("lastReportDate") as string
    const nextReportDate = formData.get("nextReportDate") as string
    const noReportRequired = formData.get("noReportRequired") === "on"
    const reportId = formData.get("reportId") as string

    // Validate dates
    const validateDate = (dateStr: string): boolean => {
      if (!dateStr) return true // Empty dates are allowed in some cases
      try {
        const date = new Date(dateStr)
        return !isNaN(date.getTime())
      } catch {
        return false
      }
    }

    // Check all dates
    if (
      !validateDate(dateOfBirth) ||
      !validateDate(passportExpiryDate) ||
      !validateDate(visaExpiryDate) ||
      !validateDate(lastReportDate) ||
      (!noReportRequired && !validateDate(nextReportDate))
    ) {
      return { success: false, error: "One or more dates are invalid. Please check all date fields." }
    }

    // Format dates for database to prevent timezone issues
    const formattedDateOfBirth = formatDateForDB(dateOfBirth)
    const formattedPassportExpiryDate = formatDateForDB(passportExpiryDate)
    const formattedVisaExpiryDate = formatDateForDB(visaExpiryDate)
    const formattedLastReportDate = formatDateForDB(lastReportDate)
    const formattedNextReportDate = noReportRequired ? null : formatDateForDB(nextReportDate)

    // Log the data being sent to the database for debugging
    console.log("Updating customer with data:", {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      date_of_birth: formattedDateOfBirth,
      passport_number: passportNumber,
      passport_expiry_date: formattedPassportExpiryDate,
      nationality: nationality,
      visa_type: visaType,
      expiry_date: formattedVisaExpiryDate,
      application_date: formattedLastReportDate,
    })

    // Update customer data with safe operation
    const updateResult = await safeDbOperation(async () => {
      return await updateCustomer(id, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        date_of_birth: formattedDateOfBirth,
        passport_number: passportNumber,
        passport_expiry_date: formattedPassportExpiryDate,
        nationality: nationality,
        visa_type: visaType,
        expiry_date: formattedVisaExpiryDate,
        application_date: formattedLastReportDate,
      })
    })

    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }

    // If there's a report ID, verify it belongs to this customer and company
    if (reportId) {
      const reportCheck = await sql`
        SELECT r.id FROM reports r
        JOIN customers c ON r.customer_id = c.id
        WHERE r.id = ${Number.parseInt(reportId)}
        AND c.company_id = ${session.company_id}
      `

      if (reportCheck.length === 0) {
        return { success: false, error: "Report not found or access denied" }
      }
    }

    // Handle report data
    if (noReportRequired) {
      // If no report is required and there's an existing report, delete it
      if (reportId) {
        const deleteResult = await safeDbOperation(async () => {
          return await deleteReport(Number.parseInt(reportId))
        })

        if (!deleteResult.success) {
          return { success: false, error: deleteResult.error }
        }
      }
    } else {
      // If a report is required
      if (reportId) {
        // Update existing report
        const updateReportResult = await safeDbOperation(async () => {
          return await updateReport(Number.parseInt(reportId), {
            due_date: formattedNextReportDate || "",
            status: "pending",
          })
        })

        if (!updateReportResult.success) {
          return { success: false, error: updateReportResult.error }
        }
      } else {
        // Create a new report
        const createReportResult = await safeDbOperation(async () => {
          return await createReport(id, {
            due_date: formattedNextReportDate || "",
            status: "pending",
          })
        })

        if (!createReportResult.success) {
          return { success: false, error: createReportResult.error }
        }
      }
    }

    // Only revalidate paths if all operations succeeded
    revalidatePath(`/customers/${id}`, "page")
    revalidatePath("/customers", "page")
    revalidatePath("/dashboard", "page")
    revalidatePath("/", "layout") // Revalidate the root layout to ensure all pages get fresh data

    // Return success
    return { success: true, customerId: id }
  } catch (error) {
    console.error("Error updating customer:", error)

    // Check for rate limit errors in various formats
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("Too Many R") ||
      (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many"))
    ) {
      return {
        success: false,
        error: "The database is currently experiencing high traffic. Please try again in a few moments.",
      }
    }

    return { success: false, error: "An unexpected error occurred while updating the customer" }
  }
}
