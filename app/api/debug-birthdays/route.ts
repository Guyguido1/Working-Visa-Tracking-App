import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/session"

export async function GET() {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all customers with their date of birth
    const customers = await sql`
      SELECT id, first_name, last_name, date_of_birth
      FROM customers
      WHERE company_id = ${session.company_id}
    `

    // Current date info
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const todayMonth = today.getMonth()
    const todayDate = today.getDate()
    const tomorrowMonth = tomorrow.getMonth()
    const tomorrowDate = tomorrow.getDate()

    // Process each customer
    const results = customers.map((customer) => {
      if (!customer.date_of_birth) {
        return {
          ...customer,
          match: false,
          reason: "No birth date",
        }
      }

      const birth = new Date(customer.date_of_birth)
      const birthMonth = birth.getMonth()
      const birthDate = birth.getDate()

      const isToday = birthMonth === todayMonth && birthDate === todayDate
      const isTomorrow = birthMonth === tomorrowMonth && birthDate === tomorrowDate
      const isMatch = isToday || isTomorrow

      return {
        ...customer,
        date_of_birth: customer.date_of_birth,
        birthMonth,
        birthDate,
        todayMonth,
        todayDate,
        tomorrowMonth,
        tomorrowDate,
        isToday,
        isTomorrow,
        match: isMatch,
        reason: isMatch
          ? isToday
            ? "Birthday is today"
            : "Birthday is tomorrow"
          : "Birthday is not today or tomorrow",
      }
    })

    return NextResponse.json({
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      todayMonth,
      todayDate,
      tomorrowMonth,
      tomorrowDate,
      customers: results,
    })
  } catch (error) {
    console.error("Debug birthday error:", error)
    return NextResponse.json({ error: "Failed to debug birthdays" }, { status: 500 })
  }
}
