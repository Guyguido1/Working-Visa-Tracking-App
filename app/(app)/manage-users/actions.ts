"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function fetchUsers() {
  const session = await getSession()

  if (!session || !session.is_admin) {
    throw new Error("Unauthorized")
  }

  const users = await sql`
    SELECT id, name, email, role, is_admin, created_at
    FROM users
    WHERE company_id = ${session.company_id}
    ORDER BY created_at DESC
  `

  return users
}

export async function fetchCompanyName() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const companies = await sql`
    SELECT name FROM companies WHERE id = ${session.company_id}
  `

  return companies[0]?.name || null
}

export async function addUser(formData: FormData) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const isAdmin = formData.get("isAdmin") === "true"

  if (!name || !email || !password || !role) {
    return { success: false, error: "All fields are required" }
  }

  try {
    // Check if email already exists in this company
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND company_id = ${session.company_id}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await hashPassword(password)

    await sql`
      INSERT INTO users (name, email, password, role, is_admin, company_id)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, ${isAdmin}, ${session.company_id})
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error adding user:", error)
    return { success: false, error: "Failed to add user" }
  }
}

export async function updateUser(userId: number, formData: FormData) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const isAdmin = formData.get("isAdmin") === "true"

  if (!name || !email || !role) {
    return { success: false, error: "All fields are required" }
  }

  try {
    // Verify user belongs to same company
    const userCheck = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    if (userCheck.length === 0) {
      return { success: false, error: "User not found" }
    }

    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role}, is_admin = ${isAdmin}
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Verify user belongs to same company
    const userCheck = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    if (userCheck.length === 0) {
      return { success: false, error: "User not found" }
    }

    const hashedPassword = await hashPassword(newPassword)

    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function deleteUser(userId: number) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Verify user belongs to same company and is not self
    const userCheck = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${session.company_id} AND id != ${session.user_id}
    `

    if (userCheck.length === 0) {
      return { success: false, error: "Cannot delete this user" }
    }

    await sql`
      DELETE FROM users
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}
