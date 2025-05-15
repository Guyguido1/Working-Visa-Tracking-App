"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/session"

// Types
export type Customer = {
  id: number
  company_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_number: string
  nationality: string
  visa_type: string
  expiry_date: string | null
  application_date: string | null
  date_of_birth: string | null
  passport_expiry_date: string | null
  created_at: string
  updated_at: string
}

export type Report = {
  id: number
  customer_id: number
  title: string
  description: string
  due_date: string
  status: string
  note?: string | null
  latest_note?: string | null // Add this field for the latest note
  status_updated_at?: string | null
  created_at: string
  updated_at: string
}

export type CustomerWithReport = Customer & {
  report?: Report
}

export type DashboardData = {
  counts: {
    totalCustomers: number
    visaReportNotDue: number
    reportsDue15Days: number
    visaExpiring30Days: number
    passportExpiring30Days: number
    birthdays: number
  }
  categories: {
    allCustomers: CustomerWithReport[]
    visaReportNotDue: CustomerWithReport[]
    reportsDue15Days: CustomerWithReport[]
    visaExpiring30Days: CustomerWithReport[]
    passportExpiring30Days: CustomerWithReport[]
    birthdays: CustomerWithReport[]
  }
}

function ensureDateString(date: Date | string | null | undefined): string | null {
  if (!date) return null
  if (date instanceof Date) {
    return date.toISOString().split("T")[0]
  }
  return String(date)
}

export async function getDashboardStats(tenantId?: number): Promise<DashboardData | { success: false; name: string }> {
  try {
    // Get the user's session to access their company_id if not provided
    let companyId = tenantId
    if (!companyId) {
      const session = await getSession()
      if (!session?.company_id) {
        return { success: false, name: "Missing company ID" }
      }
      companyId = session.company_id
    }

    // Validate company ID
    if (!companyId || typeof companyId !== "number") {
      return { success: false, name: "Invalid company ID" }
    }

    // Get customers with their most recent report and latest note
    const customersWithReports = await sql`
      WITH latest_notes AS (
        SELECT 
          report_id,
          content as latest_note_content,
          ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at DESC) as rn
        FROM report_notes
      )
      SELECT 
        c.*,
        r.id as report_id,
        r.title as report_title,
        r.description as report_description,
        r.due_date as report_due_date,
        r.status as report_status,
        r.note as report_note,
        ln.latest_note_content as report_latest_note,
        r.status_updated_at as report_status_updated_at,
        r.created_at as report_created_at,
        r.updated_at as report_updated_at
      FROM 
        customers c
      LEFT JOIN (
        SELECT DISTINCT ON (customer_id) *
        FROM reports
        ORDER BY customer_id, due_date DESC
      ) r ON c.id = r.customer_id
      LEFT JOIN latest_notes ln ON r.id = ln.report_id AND ln.rn = 1
      WHERE 
        c.company_id = ${companyId}
    `

    const transformedCustomers: CustomerWithReport[] = customersWithReports.map((row) => {
      const customer = {
        id: row.id,
        company_id: row.company_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        passport_number: row.passport_number,
        nationality: row.nationality,
        visa_type: row.visa_type,
        expiry_date: ensureDateString(row.expiry_date),
        application_date: ensureDateString(row.application_date),
        date_of_birth: ensureDateString(row.date_of_birth),
        passport_expiry_date: ensureDateString(row.passport_expiry_date),
        created_at: ensureDateString(row.created_at) || "",
        updated_at: ensureDateString(row.updated_at) || "",
      } as Customer

      if (row.report_id) {
        customer.report = {
          id: row.report_id,
          customer_id: row.id,
          title: row.report_title,
          description: row.report_description,
          due_date: ensureDateString(row.report_due_date) || "",
          status: row.report_status,
          note: row.report_note,
          latest_note: row.report_latest_note, // Add the latest note
          status_updated_at: ensureDateString(row.report_status_updated_at),
          created_at: ensureDateString(row.report_created_at) || "",
          updated_at: ensureDateString(row.report_updated_at) || "",
        }
      }

      return customer
    })

    const currentDate = new Date()
    const in15Days = new Date()
    in15Days.setDate(currentDate.getDate() + 15)

    const in30Days = new Date()
    in30Days.setDate(currentDate.getDate() + 30)

    // Filter reports due in 15 days - include all statuses for display with indicators
    const reportsDue15Days = transformedCustomers.filter(
      (customer) =>
        customer.report &&
        customer.report.due_date &&
        new Date(customer.report.due_date) <= in15Days &&
        new Date(customer.report.due_date) >= currentDate,
    )

    const visaExpiring30Days = transformedCustomers.filter(
      (customer) =>
        customer.expiry_date &&
        new Date(customer.expiry_date) <= in30Days &&
        new Date(customer.expiry_date) >= currentDate,
    )

    const passportExpiring30Days = transformedCustomers.filter(
      (customer) =>
        customer.passport_expiry_date &&
        new Date(customer.passport_expiry_date) <= in30Days &&
        new Date(customer.passport_expiry_date) >= currentDate,
    )

    // Birthday filtering logic (exact match day & month)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const todayMonth = today.getMonth()
    const todayDate = today.getDate()
    const tomorrowMonth = tomorrow.getMonth()
    const tomorrowDate = tomorrow.getDate()

    const birthdays = transformedCustomers.filter((customer) => {
      if (!customer.date_of_birth) return false

      const birth = new Date(customer.date_of_birth)
      const birthMonth = birth.getMonth()
      const birthDate = birth.getDate()

      // Calculate the match before returning
      const isMatch =
        (birthMonth === todayMonth && birthDate === todayDate) ||
        (birthMonth === tomorrowMonth && birthDate === tomorrowDate)

      return isMatch
    })

    const visaReportNotDue = transformedCustomers.filter(
      (customer) =>
        !reportsDue15Days.some((c) => c.id === customer.id) &&
        !visaExpiring30Days.some((c) => c.id === customer.id) &&
        !passportExpiring30Days.some((c) => c.id === customer.id),
    )

    return {
      counts: {
        totalCustomers: transformedCustomers.length,
        visaReportNotDue: visaReportNotDue.length,
        reportsDue15Days: reportsDue15Days.length,
        visaExpiring30Days: visaExpiring30Days.length,
        passportExpiring30Days: passportExpiring30Days.length,
        birthdays: birthdays.length,
      },
      categories: {
        allCustomers: transformedCustomers,
        visaReportNotDue,
        reportsDue15Days,
        visaExpiring30Days,
        passportExpiring30Days,
        birthdays,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { success: false, name: "Failed to fetch dashboard statistics" }
  }
}

// New function to get reports due in the next 15 days with status information
export async function getReportsDueIn15Days(): Promise<{ success: boolean; reports?: any[]; error?: string }> {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session?.company_id) {
      return { success: false, error: "Missing company ID" }
    }

    const reports = await sql`
      WITH latest_notes AS (
        SELECT 
          report_id,
          content as latest_note_content,
          ROW_NUMBER() OVER (PARTITION BY report_id ORDER BY created_at DESC) as rn
        FROM report_notes
      )
      SELECT 
        r.id, 
        r.customer_id, 
        r.title, 
        r.due_date, 
        r.status, 
        r.note, 
        ln.latest_note_content,
        r.status_updated_at,
        c.first_name,
        c.last_name,
        c.email
      FROM reports r
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN latest_notes ln ON r.id = ln.report_id AND ln.rn = 1
      WHERE c.company_id = ${session.company_id}
      AND r.due_date <= (CURRENT_DATE + INTERVAL '15 days')
      AND r.due_date >= CURRENT_DATE
      ORDER BY r.due_date ASC
    `

    return {
      success: true,
      reports: reports.map((report) => ({
        id: report.id,
        customer_id: report.customer_id,
        title: report.title,
        due_date: ensureDateString(report.due_date),
        status: report.status,
        note: report.note,
        latest_note: report.latest_note_content,
        status_updated_at: ensureDateString(report.status_updated_at),
        customer_name: `${report.first_name} ${report.last_name}`,
        customer_email: report.email,
      })),
    }
  } catch (error) {
    console.error("Error fetching reports due in 15 days:", error)
    return { success: false, error: "Failed to fetch reports" }
  }
}
