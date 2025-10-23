"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().min(1, "Company name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    return {
      error: Object.values(errors).flat()[0] || "Validation failed",
    }
  }

  const { name, email, companyName, password } = validatedFields.data

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        error: "An account with this email already exists",
      }
    }

    // Check if company name already exists
    const existingTenants = await sql`
      SELECT id FROM tenants WHERE company_name = ${companyName}
    `

    if (existingTenants.length > 0) {
      return {
        error: "A company with this name already exists",
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create tenant
    const tenants = await sql`
      INSERT INTO tenants (company_name)
      VALUES (${companyName})
      RETURNING id
    `

    const tenantId = tenants[0].id

    // Create admin user
    await sql`
      INSERT INTO users (tenant_id, email, password_hash, name, role)
      VALUES (${tenantId}, ${email}, ${passwordHash}, ${name}, 'admin')
    `

    return {
      success: "Registration successful! Redirecting to login...",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "An error occurred during registration. Please try again.",
    }
  }
}

// Alias for backwards compatibility
export const registerCompanyAdmin = register
