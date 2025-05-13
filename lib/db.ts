import { neon } from "@neondatabase/serverless"

// Create a SQL client with the database URL
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to safely execute SQL queries with error handling
async function safeQuery<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query()
  } catch (error) {
    // Check if this is a rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("Too Many R") ||
      (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many"))
    ) {
      throw new Error("Too Many Requests - Rate limit exceeded")
    }

    // Rethrow other errors
    throw error
  }
}

// Helper function to get company data
export async function getCompanyData(companyId: number) {
  const company = await safeQuery(
    () => sql`
    SELECT * FROM companies WHERE id = ${companyId}
  `,
  )
  return company[0]
}

// Helper function to get dashboard stats
export async function getDashboardStats(companyId: number) {
  const totalCustomers = await safeQuery(
    () => sql`
    SELECT COUNT(*) as count FROM customers WHERE company_id = ${companyId}
  `,
  )

  // Get count of customers with reports due in 15 days
  const pendingReports = await safeQuery(
    () => sql`
    SELECT COUNT(*) as count FROM reports r
    JOIN customers c ON r.customer_id = c.id
    WHERE c.company_id = ${companyId} 
    AND r.status = 'pending'
    AND r.due_date <= (CURRENT_DATE + INTERVAL '15 days')
    AND r.due_date >= CURRENT_DATE
  `,
  )

  // Get count of customers with visa expiring in 30 days
  const visaExpiringCount = await safeQuery(
    () => sql`
    SELECT COUNT(*) as count FROM customers
    WHERE company_id = ${companyId}
    AND expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND expiry_date >= CURRENT_DATE
  `,
  )

  // Get count of customers with passport expiring in 30 days
  const passportExpiringCount = await safeQuery(
    () => sql`
    SELECT COUNT(*) as count FROM customers
    WHERE company_id = ${companyId}
    AND passport_expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND passport_expiry_date >= CURRENT_DATE
  `,
  )

  // Get count of customers with birthdays today or tomorrow
const birthdaysCount = await safeQuery(
  () => sql`
  SELECT COUNT(*) as count FROM customers
  WHERE company_id = ${companyId}
  AND (
    -- Today's birthdays
    (
      EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE) AND
      EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
    )
    OR
    -- Tomorrow's birthdays
    (
      EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM (CURRENT_DATE + INTERVAL '1 day')) AND
      EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 day'))
    )
  )
  `,
)

  return {
    totalCustomers: Number.parseInt(totalCustomers[0].count),
    pendingReports: Number.parseInt(pendingReports[0].count),
    visaExpiringCount: Number.parseInt(visaExpiringCount[0].count),
    passportExpiringCount: Number.parseInt(passportExpiringCount[0].count || "0"),
    birthdaysCount: Number.parseInt(birthdaysCount[0].count || "0"),
  }
}

// Helper function to get customers for a company
export async function getCompanyCustomers(companyId: number) {
  const customers = await safeQuery(
    () => sql`
    SELECT * FROM customers WHERE company_id = ${companyId}
    ORDER BY created_at DESC
  `,
  )
  return customers
}

// Helper function to get a customer by ID
export async function getCustomerById(id: number) {
  const customer = await safeQuery(
    () => sql`
    SELECT * FROM customers WHERE id = ${id}
  `,
  )

  // Get associated report if any
  const reports = await safeQuery(
    () => sql`
    SELECT * FROM reports 
    WHERE customer_id = ${id}
    ORDER BY due_date DESC
    LIMIT 1
  `,
  )

  const customerData = customer[0] || null
  const reportData = reports[0] || null

  return { customer: customerData, report: reportData }
}

// Helper function to update a customer
export async function updateCustomer(
  id: number,
  data: {
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth: string | null
    passport_number: string
    passport_expiry_date: string | null
    nationality: string
    visa_type: string
    expiry_date: string | null
    application_date: string | null
  },
) {
  return await safeQuery(
    () => sql`
    UPDATE customers
    SET 
      first_name = ${data.first_name},
      last_name = ${data.last_name},
      email = ${data.email},
      phone = ${data.phone},
      date_of_birth = ${data.date_of_birth},
      passport_number = ${data.passport_number},
      passport_expiry_date = ${data.passport_expiry_date},
      nationality = ${data.nationality},
      visa_type = ${data.visa_type},
      expiry_date = ${data.expiry_date},
      application_date = ${data.application_date},
      updated_at = NOW()
    WHERE id = ${id}
  `,
  )
}

// Helper function to update a report
export async function updateReport(
  id: number,
  data: {
    due_date: string
    status: string
  },
) {
  return await safeQuery(
    () => sql`
    UPDATE reports
    SET 
      due_date = ${data.due_date},
      status = ${data.status},
      updated_at = NOW()
    WHERE id = ${id}
  `,
  )
}

// Helper function to create a new report
export async function createReport(
  customerId: number,
  data: {
    due_date: string
    status: string
  },
) {
  return await safeQuery(
    () => sql`
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
      ${data.due_date},
      ${data.status}
    )
  `,
  )
}

// Helper function to delete a report
export async function deleteReport(id: number) {
  return await safeQuery(
    () => sql`
    DELETE FROM reports
    WHERE id = ${id}
  `,
  )
}
