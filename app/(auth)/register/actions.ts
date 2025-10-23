"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"
import { getSession } from "@/app/actions/session"

// Define validation schema
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
  name?: string
}

export async function register(prevState: RegisterFormState, formData: FormData) {
  try {
    // Check if user is already logged in
    const session = await getSession()
    if (session) {
      return {
        success: false,
        name: "Already logged in",
        errors: {
          _form: ["You are already logged in. Please log out first."],
        },
      }
    }

    // Validate form data
    const validatedFields = RegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      companyName: formData.get("companyName"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    // If form validation fails, return errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please correct the errors in the form.",
        success: false,
        name: "Validation failed",
      }
    }

    const { name, email, companyName, password } = validatedFields.data

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return {
        errors: {
          email: ["Email already registered"],
          _form: ["Email already registered. Please use a different email address."],
        },
        success: false,
        name: "Email already registered",
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // 1. Insert new company
    const companyResult = await sql`
      INSERT INTO companies (name, email)
      VALUES (${companyName}, ${email})
      RETURNING id
    `
    const companyId = companyResult[0].id

    // 2. Insert admin user linked to the company
    await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${companyId}, ${name}, ${email}, ${hashedPassword}, ${true}, 'admin')
    `

    // Return success instead of redirecting
    return {
      success: true,
      message: "Registration successful! Please log in.",
    }
  } catch (error) {
    console.error("Registration failed:", error)

    return {
      success: false,
      name: "An unexpected error occurred during registration",
      errors: {
        _form: ["An unexpected error occurred during registration"],
      },
    }
  }
}

// Keep the old export for backwards compatibility
export { register as registerCompanyAdmin }
