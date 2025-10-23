import { cookies } from "next/headers"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: number, companyId: number) {
  const cookieStore = await cookies()
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

  // Delete any existing sessions for this user
  await sql`
    DELETE FROM sessions 
    WHERE user_id = ${userId}
  `

  // Create new session
  const result = await sql`
    INSERT INTO sessions (user_id, company_id, expires_at)
    VALUES (${userId}, ${companyId}, ${expiresAt})
    RETURNING id
  `

  const sessionId = result.rows[0].id

  // Set session cookie
  cookieStore.set("session", sessionId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) {
    return null
  }

  const result = await sql`
    SELECT s.*, u.email, u.role, u.company_id
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
    AND s.expires_at > NOW()
  `

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
  }

  cookieStore.delete("session")
}
