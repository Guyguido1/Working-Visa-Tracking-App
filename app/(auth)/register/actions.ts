"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().min(1, "Company name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
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
  prevState: RegisterFormState | undefined,
  formData: FormData,
): Promise<RegisterFormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, companyName, password } = validatedFields.data

  try {
    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          _form: ["An account with this email already exists"],
        },
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create company
    const companies = await sql`
      INSERT INTO companies (name)
      VALUES (${companyName})
      RETURNING id
    `

    const companyId = companies[0].id

    // Create admin user
    await sql`
      INSERT INTO users (name, email, password, company_id, is_admin, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${companyId}, true, 'admin')
    `

    return {
      success: true,
      message: "Registration successful! Please log in.",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {
        _form: ["An error occurred during registration. Please try again."],
      },
    }
  }
}
