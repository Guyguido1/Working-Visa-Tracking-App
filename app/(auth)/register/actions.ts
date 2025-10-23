"use server"

import { sql } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import { z } from "zod"

const RegisterSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export type RegisterFormState = {
  errors?: {
    companyName?: string[]
    name?: string[]
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  message?: string
  redirectTo?: string
}

export async function registerCompanyAdmin(
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  const validatedFields = RegisterSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { companyName, name, email, password } = validatedFields.data

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["This email is already registered"],
        },
        message: "This email is already registered",
      }
    }

    // Create company
    const companies = await sql`
      INSERT INTO companies (name)
      VALUES (${companyName})
      RETURNING id
    `

    const companyId = companies[0].id

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create admin user
    const users = await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${companyId}, ${name}, ${email}, ${passwordHash}, true, 'admin')
      RETURNING id
    `

    const userId = users[0].id

    // Create session
    await createSession(userId, companyId)

    return {
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {
        _form: ["An error occurred during registration. Please try again."],
      },
      message: "An error occurred during registration. Please try again.",
    }
  }
}
