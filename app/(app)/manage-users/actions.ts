"use server"

import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getCompanyIdFromSession } from "@/lib/auth"

export async function fetchUsers(companyId: number) {
  try {
    const users = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.is_admin,
        c.name as company_name
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.company_id = ${companyId}
      ORDER BY u.name
    `
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return { error: "Failed to fetch users" }
  }
}

export async function getUsers() {
  const companyId = await getCompanyIdFromSession()

  if (!companyId) {
    throw new Error("Unauthorized")
  }

  const result = await sql`
    SELECT id, email, role, created_at
    FROM users
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
  `

  return result.rows
}

export async function addUser(formData: {
  name: string
  email: string
  password: string
  role: string
  isAdmin: boolean
}) {
  try {
    const companyId = await getCompanyIdFromSession()
    if (!companyId) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if email already exists in the company
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${formData.email} AND company_id = ${companyId}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "A user with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 10)

    // Insert new user
    await sql`
      INSERT INTO users (name, email, password, company_id, role, is_admin)
      VALUES (
        ${formData.name}, 
        ${formData.email}, 
        ${hashedPassword}, 
        ${companyId}, 
        ${formData.role}, 
        ${formData.isAdmin}
      )
    `

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error adding user:", error)
    return { success: false, error: "Failed to add user" }
  }
}

export async function updateUser(userId: number, formData: FormData) {
  const companyId = await getCompanyIdFromSession()

  if (!companyId) {
    return { success: false, error: "Unauthorized" }
  }

  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const newPassword = formData.get("newPassword") as string

  try {
    // Verify the user belongs to the same company
    const users = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${companyId}
    `

    if (users.length === 0) {
      return { success: false, error: "User not found or unauthorized" }
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await sql`
        UPDATE users
        SET email = ${email}, role = ${role}, password = ${hashedPassword}
        WHERE id = ${userId}
      `
    } else {
      await sql`
        UPDATE users
        SET email = ${email}, role = ${role}
        WHERE id = ${userId}
      `
    }

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    const companyId = await getCompanyIdFromSession()
    if (!companyId) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify the user belongs to the same company
    const users = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${companyId}
    `

    if (users.length === 0) {
      return { success: false, error: "User not found or unauthorized" }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE id = ${userId}
    `

    // Delete all sessions for this user (force re-login)
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user password:", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function deleteUser(userId: number) {
  try {
    const companyId = await getCompanyIdFromSession()
    if (!companyId) {
      throw new Error("Unauthorized")
    }

    // Verify the user belongs to the same company
    const users = await sql`
      SELECT id FROM users 
      WHERE id = ${userId} AND company_id = ${companyId}
    `

    if (users.length === 0) {
      throw new Error("User not found or unauthorized")
    }

    // Delete user's sessions first
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`

    // Delete the user
    await sql`DELETE FROM users WHERE id = ${userId}`

    revalidatePath("/manage-users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export async function fetchCompanyName() {
  try {
    const companyId = await getCompanyIdFromSession()
    if (!companyId) {
      return { success: false, error: "Unauthorized", name: "Unknown Company" }
    }

    const companies = await sql`
      SELECT name FROM companies WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      return { success: false, error: "Company not found", name: "Unknown Company" }
    }

    return { success: true, name: companies[0].name }
  } catch (error) {
    console.error("Error fetching company name:", error)
    return { success: false, error: "Failed to fetch company name", name: "Unknown Company" }
  }
}
