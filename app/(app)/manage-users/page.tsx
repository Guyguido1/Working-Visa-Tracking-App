import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import UserManagement from "./user-management"

export default async function ManageUsersPage() {
  // Get the current user from the session
  const session = await getSession()

  // If no user is logged in, redirect to login
  if (!session) {
    redirect("/login")
  }

  // If user is not an admin, redirect to dashboard
  if (!session.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
      <UserManagement currentUser={session} />
    </div>
  )
}
