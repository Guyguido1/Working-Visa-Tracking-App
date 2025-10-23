"use server"

import { getSession as authGetSession } from "@/lib/auth"

// Re-export getSession as a named export
export { authGetSession as getSession }

export async function getCurrentUser() {
  try {
    const session = await authGetSession()
    if (!session) {
      return null
    }

    return {
      id: session.user_id,
      name: session.name,
      email: session.email,
      is_admin: session.is_admin,
      role: session.role,
      company_id: session.company_id,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
