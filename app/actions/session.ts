"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import crypto from "crypto"

export async function createSession(userId: number) {
  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 12) // 12 hour session

  // Delete any existing sessions for this user (single session per user)
  await sql`
    DELETE FROM sessions WHERE user_id = ${userId}
  `

  // Create new session
  const result = await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt})
    RETURNING id
  `

  const sessionId = result[0].id

  // Set cookie
  cookies().set("session_id", sessionId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })

  return sessionId
}

export async function getSession() {
  const sessionId = cookies().get("session_id")?.value

  if (!sessionId) {
    return null
  }

  try {
    const sessions = await sql`
      SELECT s.id, s.user_id, s.expires_at as expires, s.token as session_token, 
             u.name, u.email, u.is_admin, u.role, u.company_id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
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
  const sessionId = cookies().get("session_id")?.value

  if (sessionId) {
    await sql`
      DELETE FROM sessions WHERE id = ${sessionId}
    `
  }

  cookies().delete("session_id")
}
