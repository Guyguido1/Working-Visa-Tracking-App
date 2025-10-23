import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function getCompanyIdFromSession(): Promise<number | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT company_id 
      FROM sessions 
      WHERE token = ${sessionToken} 
      AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    return sessions[0].company_id
  } catch (error) {
    console.error("Error getting company ID from session:", error)
    return null
  }
}

export async function getUserIdFromSession(): Promise<number | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT user_id 
      FROM sessions 
      WHERE token = ${sessionToken} 
      AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    return sessions[0].user_id
  } catch (error) {
    console.error("Error getting user ID from session:", error)
    return null
  }
}
