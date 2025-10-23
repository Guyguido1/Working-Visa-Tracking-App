"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import crypto from "crypto"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function loginUser(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Find user by email
    const users = await sql`
      SELECT id, email, password, company_id, is_admin, role 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
      }
    }

    const user = users[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
      }
    }

    // Delete any existing sessions for this user (single session per user)
    await sql`
      DELETE FROM sessions 
      WHERE user_id = ${user.id}
    `

    // Create new session
    const sessionToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    await sql`
      INSERT INTO sessions (user_id, company_id, token, expires_at)
      VALUES (${user.id}, ${user.company_id}, ${sessionToken}, ${expiresAt})
    `

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {
        _form: ["An error occurred during login. Please try again."],
      },
    }
  }
}
