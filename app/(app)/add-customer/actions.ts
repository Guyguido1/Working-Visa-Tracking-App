"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"

export async function addCustomer(formData: FormData) {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()

    if (!session?.company_id) {
      return { success: false, name: "Missing company ID" }
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
    const applicationDate = formData.get("applicationDate") as string
    const nextReportDate = formData.get("nextReportDate") as string
    const noReportRequired = formData.get("noReportRequired") === "on"

    // Format dates for database
    const formatDate = (dateStr: string | null): string | null => {
      if (!dateStr) return null
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return null
        return date.toISOString().split("T")[0] // YYYY-MM-DD format
      } catch {
        return null
      }
    }

    const formattedDateOfBirth = formatDate(dateOfBirth)
    const formattedPassportExpiryDate = formatDate(passportExpiryDate)
    const formattedVisaExpiryDate = formatDate(visaExpiryDate)
    const formattedApplicationDate = formatDate(applicationDate)
    const formattedNextReportDate = noReportRequired ? null : formatDate(nextReportDate)

    // Insert customer with the session's company_id
    const result = await sql`
      INSERT INTO customers (
        company_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        passport_number,
        passport_expiry_date,
        nationality,
        visa_type,
        expiry_date,
        application_date
      )
      VALUES (
        ${session.company_id},
        ${firstName},
        ${lastName},
        ${email},
        ${phone},
        ${formattedDateOfBirth},
        ${passportNumber},
        ${formattedPassportExpiryDate},
        ${nationality},
        ${visaType},
        ${formattedVisaExpiryDate},
        ${formattedApplicationDate}
      )
      RETURNING id
    `

    const customerId = result[0]?.id

    // Create report if required
    if (!noReportRequired && formattedNextReportDate) {
      await sql`
        INSERT INTO reports (
          customer_id,
          title,
          description,
          due_date,
          status
        )
        VALUES (
          ${customerId},
          'Regular Check-in',
          'Scheduled follow-up report',
          ${formattedNextReportDate},
          'pending'
        )
      `
    }

    revalidatePath("/dashboard")
    revalidatePath("/customers")

    return { success: true, customerId }
  } catch (error) {
    console.error("Error adding customer:", error)
    return { success: false, error: "Failed to add customer" }
  }
}
