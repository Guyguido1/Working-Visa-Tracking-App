import { getDashboardStats } from "../../actions/dashboard"
import DashboardContent from "./dashboard-content"
import { getSession } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { refresh?: string }
}) {
  // Get the user's session to access their company_id
  const session = await getSession()
  if (!session) redirect("/login")

  // Ensure company_id exists
  if (!session.company_id) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Error loading dashboard</h2>
        <p className="text-red-600">Missing company ID in session</p>
      </div>
    )
  }

  // Force dynamic rendering when refresh parameter is present
  const dynamic = searchParams?.refresh ? true : false

  try {
    // Fetch all data server-side with cache control
    const dashboardData = await getDashboardStats(session.company_id)

    // Check if dashboardData is an error object
    if (dashboardData && "success" in dashboardData && "name" in dashboardData && !dashboardData.success) {
      // Handle the error - show an error message instead of passing to DashboardContent
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700">Error loading dashboard</h2>
          <p className="text-red-600">{dashboardData.name || "Unknown error"}</p>
        </div>
      )
    }

    return <DashboardContent counts={dashboardData.counts} categories={dashboardData.categories} />
  } catch (error) {
    console.error("Error in dashboard page:", error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Error loading dashboard</h2>
        <p className="text-red-600">An unexpected error occurred</p>
      </div>
    )
  }
}

// Add export const dynamic = 'force-dynamic' to ensure fresh data
export const dynamic = "force-dynamic"
