"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return null
  }

  try {
    const sessions = await sql`
      SELECT s.id, s.user_id, s.expires, s.session_token, 
             u.name, u.email, u.is_admin, u.role, u.company_id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    return sessions[0]
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    await sql`
      DELETE FROM sessions WHERE id = ${sessionId}
    `
  }

  cookieStore.delete("session_id")
}
