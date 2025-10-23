"use server"

import { z } from "zod"
import { sql } from "@vercel/postgres"
import { hashPassword, createSession } from "@/lib/auth"

const registerSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export async function registerUser(prevState: any, formData: FormData) {
  const companyName = formData.get("companyName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  const validation = registerSchema.safeParse({
    companyName,
    email,
    password,
    confirmPassword,
  })

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: "Invalid input",
    }
  }

  try {
    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return {
        errors: { email: ["Email already registered"] },
        message: "Email already registered",
      }
    }

    // Create company
    const companyResult = await sql`
      INSERT INTO companies (name)
      VALUES (${companyName})
      RETURNING id
    `

    const companyId = companyResult.rows[0].id

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const userResult = await sql`
      INSERT INTO users (email, password, role, company_id)
      VALUES (${email}, ${hashedPassword}, 'admin', ${companyId})
      RETURNING id
    `

    const userId = userResult.rows[0].id

    // Create session
    await createSession(userId, companyId)

    return {
      errors: {},
      message: "",
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
