import { getDashboardStats } from "../actions/dashboard"
import CustomerManagement from "./customer-management"
import { getSession } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function CustomersPage() {
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) redirect("/login")

  // Fetch all customers data server-side
  const dashboardData = await getDashboardStats(session.company_id)

  // Pass all customers to the client component
  return <CustomerManagement customers={dashboardData.categories.allCustomers} />
}

// Add export const dynamic = 'force-dynamic' to ensure fresh data
export const dynamic = "force-dynamic"
