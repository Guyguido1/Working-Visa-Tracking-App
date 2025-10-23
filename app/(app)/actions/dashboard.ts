"use server"

import { sql } from "@vercel/postgres"
import { getSession } from "@/lib/auth"

export async function getDashboardData(filters?: {
  search?: string
  visaType?: string
  status?: string
}) {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  let query = `
    WITH latest_notes AS (
      SELECT DISTINCT ON (rn.report_id)
        rn.report_id,
        rn.note,
        rn.created_at
      FROM report_notes rn
      ORDER BY rn.report_id, rn.created_at DESC
    )
    SELECT 
      c.*,
      r.id as report_id,
      r.title as report_title,
      r.due_date,
      r.status as report_status,
      r.note as legacy_note,
      ln.note as latest_note
    FROM customers c
    LEFT JOIN reports r ON c.id = r.customer_id
    LEFT JOIN latest_notes ln ON r.id = ln.report_id
    WHERE c.company_id = $1
  `

  const params: any[] = [session.company_id]
  let paramIndex = 2

  if (filters?.search) {
    query += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.passport_number ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters?.visaType) {
    query += ` AND c.visa_type = $${paramIndex}`
    params.push(filters.visaType)
    paramIndex++
  }

  if (filters?.status) {
    if (filters.status === "expiring_soon") {
      query += ` AND (c.expiry_date <= $${paramIndex} OR c.passport_expiry_date <= $${paramIndex})`
      params.push(thirtyDaysFromNow.toISOString())
      paramIndex++
    } else if (filters.status === "report_due") {
      query += ` AND r.due_date <= $${paramIndex} AND r.status != 'completed'`
      params.push(thirtyDaysFromNow.toISOString())
      paramIndex++
    }
  }

  query += ` ORDER BY c.last_name, c.first_name`

  const result = await sql.query(query, params)

  return result.rows
}

export async function getDashboardStats() {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  const [totalCustomers, expiringVisas, expiringPassports, upcomingReports, upcomingBirthdays] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM customers WHERE company_id = ${session.company_id}`,
    sql`SELECT COUNT(*) as count FROM customers WHERE company_id = ${session.company_id} AND expiry_date <= ${thirtyDaysFromNow.toISOString()} AND expiry_date >= ${today.toISOString()}`,
    sql`SELECT COUNT(*) as count FROM customers WHERE company_id = ${session.company_id} AND passport_expiry_date <= ${thirtyDaysFromNow.toISOString()} AND passport_expiry_date >= ${today.toISOString()}`,
    sql`SELECT COUNT(*) as count FROM reports r JOIN customers c ON r.customer_id = c.id WHERE c.company_id = ${session.company_id} AND r.due_date <= ${thirtyDaysFromNow.toISOString()} AND r.status != 'completed'`,
    sql`
      SELECT COUNT(*) as count 
      FROM customers 
      WHERE company_id = ${session.company_id}
      AND date_of_birth IS NOT NULL
      AND (
        (EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE) 
         AND EXTRACT(DAY FROM date_of_birth) >= EXTRACT(DAY FROM CURRENT_DATE))
        OR 
        (EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '30 days')
         AND EXTRACT(DAY FROM date_of_birth) <= EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '30 days'))
      )
    `,
  ])

  return {
    totalCustomers: Number.parseInt(totalCustomers.rows[0].count),
    expiringVisas: Number.parseInt(expiringVisas.rows[0].count),
    expiringPassports: Number.parseInt(expiringPassports.rows[0].count),
    upcomingReports: Number.parseInt(upcomingReports.rows[0].count),
    upcomingBirthdays: Number.parseInt(upcomingBirthdays.rows[0].count),
  }
}
