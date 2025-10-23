"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid email or password",
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Get user from database
    const users = await sql`
      SELECT u.*, t.id as tenant_id, t.company_name 
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = ${email}
    `

    if (users.length === 0) {
      return {
        error: "Invalid email or password",
      }
    }

    const user = users[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return {
        error: "Invalid email or password",
      }
    }

    // Delete any existing sessions for this user (enforce single session)
    await sql`
      DELETE FROM sessions 
      WHERE user_id = ${user.id}
    `

    // Create new session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    await sql`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt})
    `

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    redirect("/dashboard")
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: "An error occurred during login. Please try again.",
    }
  }
}

// Alias for backwards compatibility
export const loginUser = login
