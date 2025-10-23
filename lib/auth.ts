import bcrypt from "bcryptjs"
import { getSession } from "@/app/actions/session"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
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
