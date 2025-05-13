import { getDashboardStats } from "@/app/(app)/actions/dashboard"
import { getSession } from "@/app/actions/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  const stats = await getDashboardStats(session?.company_id || 1)

  console.log("🧪 Filtered Birthdays:", stats.categories.birthdays)

  return NextResponse.json({ birthdays: stats.categories.birthdays })
}
