"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  message?: string
  redirectTo?: string
}

export async function loginUser(prevState: any, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { email, password } = validatedFields.data

  try {
    const users = await sql`
      SELECT id, email, password_hash, company_id, is_admin, role, name
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
        message: "Invalid email or password",
      }
    }

    const user = users[0]

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
        message: "Invalid email or password",
      }
    }

    // Delete existing sessions for this user
    await sql`
      DELETE FROM sessions WHERE user_id = ${user.id}
    `

    // Create new session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    await sql`
      INSERT INTO sessions (id, user_id, company_id, expires_at)
      VALUES (${sessionId}, ${user.id}, ${user.company_id}, ${expiresAt})
    `

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return {
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {
        _form: ["An error occurred during login. Please try again."],
      },
      message: "An error occurred during login. Please try again.",
    }
  }
}
