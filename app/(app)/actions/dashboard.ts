"use server"

import { sql } from "@/lib/db"

// Update the Customer type to include the new date fields
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

// Helper function to ensure dates are strings
function ensureDateString(date: Date | string | null | undefined): string | null {
  if (!date) return null
  if (date instanceof Date) {
    return date.toISOString().split("T")[0] // YYYY-MM-DD format
  }
  return String(date)
}

export async function getDashboardStats(tenantId: number): Promise<DashboardData | { success: false; name: string }> {
  if (!tenantId || typeof tenantId !== "number") {
    return { success: false, name: "Missing company ID" }
  }

  // Get all customers with their latest report
  const customersWithReports = await sql`
    SELECT 
      c.*,
      r.id as report_id,
      r.title as report_title,
      r.description as report_description,
      r.due_date as report_due_date,
      r.status as report_status,
      r.created_at as report_created_at,
      r.updated_at as report_updated_at
    FROM 
      customers c
    LEFT JOIN (
      SELECT DISTINCT ON (customer_id) *
      FROM reports
      ORDER BY customer_id, due_date DESC
    ) r ON c.id = r.customer_id
    WHERE 
      c.company_id = ${tenantId}
  `

  // Update the transformedCustomers mapping to include the new date fields
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

    // Add report if it exists
    if (row.report_id) {
      customer.report = {
        id: row.report_id,
        customer_id: row.id,
        title: row.report_title,
        description: row.report_description,
        due_date: ensureDateString(row.report_due_date) || "",
        status: row.report_status,
        created_at: ensureDateString(row.report_created_at) || "",
        updated_at: ensureDateString(row.report_updated_at) || "",
      }
    }

    return customer
  })

  // Current date for comparisons
  const currentDate = new Date()
  const in15Days = new Date()
  in15Days.setDate(currentDate.getDate() + 15)

  const in30Days = new Date()
  in30Days.setDate(currentDate.getDate() + 30)

  // Categorize customers
  const reportsDue15Days = transformedCustomers.filter(
    (customer) =>
      customer.report &&
      customer.report.status === "pending" &&
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

  // COMPLETELY REPLACED: Birthday filtering logic with exact 2-day match
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

    return (
      (birthMonth === todayMonth && birthDate === todayDate) ||
      (birthMonth === tomorrowMonth && birthDate === tomorrowDate)
    )
  })

  // Customers with no imminent reports or expiring visas
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
}
