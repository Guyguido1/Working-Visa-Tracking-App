"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().min(1, "Company name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    companyName?: string[]
    password?: string[]
    confirmPassword?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export async function registerCompanyAdmin(
  prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    companyName: formData.get("companyName") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  // Validate input
  const result = registerSchema.safeParse(data)

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  try {
    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${data.email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["Email already registered"],
        },
        success: false,
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create company
    const companyResult = await sql`
      INSERT INTO companies (name)
      VALUES (${data.companyName})
      RETURNING id
    `

    const companyId = companyResult[0].id

    // Create admin user
    await sql`
      INSERT INTO users (name, email, password, company_id, is_admin, role)
      VALUES (${data.name}, ${data.email}, ${hashedPassword}, ${companyId}, true, 'admin')
    `

    return {
      success: true,
      message: "Registration successful! Redirecting to login...",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {
        _form: ["An error occurred during registration. Please try again."],
      },
      success: false,
    }
  }
}
