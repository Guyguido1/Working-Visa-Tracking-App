"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      }
    }

    // Find user by email
    const users = await sql`
      SELECT u.*, c.name as company_name 
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.email = ${email}
    `

    if (users.length === 0) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Delete any existing sessions for this user (single session enforcement)
    await sql`
      DELETE FROM sessions 
      WHERE user_id = ${user.id}
    `

    // Create new session
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    const sessions = await sql`
      INSERT INTO sessions (user_id, session_token, expires)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt})
      RETURNING id
    `

    const sessionId = sessions[0].id

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return {
      success: true,
      message: "Login successful",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "An error occurred during login. Please try again.",
    }
  }
}

// Alias for backwards compatibility
export const loginUser = login

export async function performRedirect() {
  redirect("/dashboard")
}
