"use server"

import { z } from "zod"
import { sql } from "@vercel/postgres"
import { verifyPassword, createSession } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validation = loginSchema.safeParse({ email, password })

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: "Invalid input",
    }
  }

  try {
    // Find user by email
    const result = await sql`
      SELECT id, email, password, role, company_id
      FROM users
      WHERE email = ${email}
    `

    if (result.rows.length === 0) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    // Create session
    await createSession(user.id, user.company_id)

    return {
      errors: {},
      message: "",
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {},
      message: "An error occurred during login. Please try again.",
    }
  }
}
