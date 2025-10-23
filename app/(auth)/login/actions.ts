"use server"

import { sql } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { createSession } from "@/app/actions/session"

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
      message: "Please fill in all fields",
    }
  }

  try {
    // Find user by email
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    // Create session
    await createSession(user.id)

    // Return redirect instead of calling redirect() directly
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
