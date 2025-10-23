"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import crypto from "crypto"

export async function createSession(userId: string, companyId: string) {
  await sql`
    DELETE FROM sessions 
    WHERE user_id = ${userId}
  `

  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000)

  await sql`
    INSERT INTO sessions (user_id, company_id, token, expires_at)
    VALUES (${userId}, ${companyId}, ${sessionToken}, ${expiresAt})
  `

  const cookieStore = await cookies()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const sessions = await sql`
    SELECT s.*, u.name, u.email, u.is_admin, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${sessionToken}
    AND s.expires_at > NOW()
  `

  if (sessions.length === 0) {
    return null
  }

  return sessions[0]
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
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
