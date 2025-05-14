"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export async function logout() {
  const sessionId = cookies().get("session_id")?.value

  if (sessionId) {
    try {
      // Delete the session from the database
      await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  // Clear the session cookie
  cookies().delete("session_id")

  // Redirect to splash page instead of login page
  redirect("/")
}
