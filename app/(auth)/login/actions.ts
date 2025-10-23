"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import bcryptjs from "bcryptjs"
import { z } from "zod"

// Define validation schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export async function login(prevState: any, formData: FormData) {
  // Validate form data
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  // If form validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { email, password } = validatedFields.data

  try {
    // Find user by email
    const users = await sql`
      SELECT id, company_id, name, email, password_hash, is_admin, role
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    const user = users[0]

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash)

    if (!passwordMatch) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    // Create session
    const sessionId = crypto.randomUUID()
    const sessionToken = crypto.randomUUID() // Generate a session token
    // Changed from 7 days to 12 hours
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    // Store session in database with all required fields
    await sql`
      INSERT INTO sessions (id, user_id, expires, session_token)
      VALUES (${sessionId}, ${user.id}, ${expires}, ${sessionToken})
    `

    // Set session cookie
    cookies().set({
      name: "session_id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires,
    })

    // Return redirectTo instead of using redirect directly
    return { redirectTo: "/dashboard" }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {},
      message: "An error occurred during login. Please try again.",
    }
  }
}

// Keep the old export for backwards compatibility
export { login as loginUser }
