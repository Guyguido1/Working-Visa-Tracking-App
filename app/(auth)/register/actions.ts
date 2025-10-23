"use server"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function register(prevState: any, formData: FormData) {
  try {
    const companyName = formData.get("companyName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    // Validate inputs
    if (!companyName || !email || !password || !fullName) {
      return {
        success: false,
        error: "All fields are required",
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      }
    }

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        success: false,
        error: "An account with this email already exists",
      }
    }

    // Create company (tenant)
    const companies = await sql`
      INSERT INTO companies (name, created_at)
      VALUES (${companyName}, NOW())
      RETURNING id
    `

    const companyId = companies[0].id

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin user
    await sql`
      INSERT INTO users (company_id, email, password_hash, full_name, role, created_at)
      VALUES (${companyId}, ${email}, ${passwordHash}, ${fullName}, 'admin', NOW())
    `

    return {
      success: true,
      message: "Registration successful! Redirecting to login...",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "An error occurred during registration. Please try again.",
    }
  }
}

// Alias for backwards compatibility
export const registerCompanyAdmin = register

export async function performRedirect() {
  redirect("/login")
}
