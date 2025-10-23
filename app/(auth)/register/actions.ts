"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z
  .object({
    companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export async function registerUser(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { companyName, name, email, password } = validatedFields.data

  try {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {},
        message: "An account with this email already exists.",
      }
    }

    const passwordHash = await bcryptjs.hash(password, 10)

    const companies = await sql`
      INSERT INTO companies (name)
      VALUES (${companyName})
      RETURNING id
    `

    const companyId = companies[0].id

    const users = await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${companyId}, ${name}, ${email}, ${passwordHash}, true, 'admin')
      RETURNING id
    `

    const userId = users[0].id

    const sessionId = crypto.randomUUID()
    const sessionToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 12 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (id, user_id, expires, session_token)
      VALUES (${sessionId}, ${userId}, ${expires}, ${sessionToken})
    `

    cookies().set({
      name: "session_id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires,
    })

    return {
      message: "Account created successfully!",
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {},
      message: "An error occurred during registration. Please try again.",
    }
  }
}
