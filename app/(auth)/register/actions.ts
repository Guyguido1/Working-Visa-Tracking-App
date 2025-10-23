"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
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
  message?: string
  success?: boolean
}

export async function registerCompanyAdmin(prevState: any, formData: FormData): Promise<RegisterFormState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
      success: false,
    }
  }

  const { name, email, companyName, password } = validatedFields.data

  try {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["This email is already registered"],
          _form: ["This email is already registered"],
        },
        message: "This email is already registered",
        success: false,
      }
    }

    const companies = await sql`
      INSERT INTO companies (name, email)
      VALUES (${companyName}, ${email})
      RETURNING id
    `

    const companyId = companies[0].id

    const passwordHash = await bcrypt.hash(password, 10)

    await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${companyId}, ${name}, ${email}, ${passwordHash}, true, 'admin')
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
      message: "An error occurred during registration. Please try again.",
      success: false,
    }
  }
}
