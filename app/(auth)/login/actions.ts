"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export async function loginUser(prevState: any, formData: FormData) {
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

    const passwordMatch = await bcryptjs.compare(password, user.password_hash)

    if (!passwordMatch) {
      return {
        errors: {},
        message: "Invalid email or password",
      }
    }

    const sessionId = crypto.randomUUID()
    const sessionToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (id, user_id, expires, session_token)
      VALUES (${sessionId}, ${user.id}, ${expires}, ${sessionToken})
    `

    cookies().set({
      name: "session_id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires,
    })

    return { redirectTo: "/dashboard" }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {},
      message: "An error occurred during login. Please try again.",
    }
  }
}
