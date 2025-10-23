"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"
import bcryptjs from "bcryptjs"

export type User = {
  id: number
  company_id: number
  name: string
  email: string
  role: string
  is_admin: boolean
  created_at: string
  updated_at: string
  company_name?: string
}

export async function fetchUsers(companyId: number): Promise<User[] | { success: false; error: string }> {
  if (!companyId || typeof companyId !== "number") {
    console.error("❌ fetchUsers: Missing or invalid company_id:", companyId)
    return { success: false, error: "Missing company ID" }
  }

  try {
    const users = await sql`
      SELECT u.*, c.name as company_name
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.company_id = ${companyId}
      ORDER BY u.created_at DESC
    `

    return users
  } catch (error) {
    console.error("❌ fetchUsers failed:", error)
    return { success: false, error: "Failed to load users" }
  }
}

export async function fetchCompanyName() {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const company = await sql`
      SELECT name FROM companies WHERE id = ${session.company_id}
    `

    if (company.length === 0) {
      return { success: false, error: "Company not found" }
    }

    return { success: true, name: company[0].name }
  } catch (error) {
    console.error("Error fetching company name:", error)
    return { success: false, error: "Failed to fetch company name" }
  }
}

export async function addUser(formData: FormData) {
  const session = await getSession()

  if (!session?.company_id) {
    return { success: false, name: "Missing company ID" }
  }

  try {
    if (!session.is_admin) {
      console.error("❌ User is not an admin:", session)
      return { success: false, name: "Only admins can add users" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const isAdmin = formData.get("is_admin") === "on"

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return { success: false, name: "Email already in use" }
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    await sql`
      INSERT INTO users (
        name, email, password_hash, role, company_id, is_admin
      ) VALUES (
        ${name}, ${email}, ${hashedPassword}, ${role}, ${session.company_id}, ${isAdmin}
      )
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("❌ Failed to insert user:", error)
    return { success: false, name: "Insert failed" }
  }
}

export async function deleteUser(userId: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    if (!session.is_admin) {
      return { success: false, error: "Only admins can delete users" }
    }

    const userCheck = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    if (userCheck.length === 0) {
      return { success: false, error: "User not found or access denied" }
    }

    await sql`DELETE FROM users WHERE id = ${userId}`

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    if (!session.is_admin) {
      return { success: false, error: "Only admins can update user passwords" }
    }

    const userCheck = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    if (userCheck.length === 0) {
      return { success: false, error: "User not found or access denied" }
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)

    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `

    return { success: true }
  } catch (error) {
    console.error("Error updating user password:", error)
    return { success: false, error: "Failed to update password" }
  }
}
