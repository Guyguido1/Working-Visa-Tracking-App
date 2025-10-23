import bcryptjs from "bcryptjs"
import { cookies } from "next/headers"
import { sql } from "./db"

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

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

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } }
  }

  return { props: { session } }
}

export async function getSessionUser() {
  const session = await getSession()
  return session
}

export async function getCompanyIdFromSession(): Promise<number | null> {
  const session = await getSession()
  return session?.company_id || null
}
