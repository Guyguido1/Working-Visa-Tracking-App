"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { getSession, hashPassword } from "@/lib/auth"

export async function getUsers() {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  const result = await sql`
    SELECT id, email, role, created_at
    FROM users
    WHERE company_id = ${session.company_id}
    ORDER BY created_at DESC
  `

  return result.rows
}

export async function addUser(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized" }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  try {
    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return { success: false, error: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    await sql`
      INSERT INTO users (email, password, role, company_id)
      VALUES (${email}, ${hashedPassword}, ${role}, ${session.company_id})
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Add user error:", error)
    return { success: false, error: "Failed to add user" }
  }
}

export async function updateUser(userId: number, formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized" }
  }

  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const newPassword = formData.get("newPassword") as string

  try {
    if (newPassword) {
      const hashedPassword = await hashPassword(newPassword)
      await sql`
        UPDATE users
        SET email = ${email}, role = ${role}, password = ${hashedPassword}
        WHERE id = ${userId} AND company_id = ${session.company_id}
      `
    } else {
      await sql`
        UPDATE users
        SET email = ${email}, role = ${role}
        WHERE id = ${userId} AND company_id = ${session.company_id}
      `
    }

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(userId: number) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await sql`
      DELETE FROM users
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, error: "Failed to delete user" }
  }
}
