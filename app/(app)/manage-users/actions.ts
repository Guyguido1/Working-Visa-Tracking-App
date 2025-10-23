"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import bcryptjs from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const UserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "user"], { message: "Please select a valid role" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).optional(),
})

export async function addUser(prevState: any, formData: FormData) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return {
      errors: {},
      message: "Unauthorized",
    }
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { name, email, role, password } = validatedFields.data

  if (!password) {
    return {
      errors: { password: ["Password is required"] },
      message: "Password is required",
    }
  }

  try {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {},
        message: "A user with this email already exists",
      }
    }

    const passwordHash = await bcryptjs.hash(password, 10)

    await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${session.company_id}, ${name}, ${email}, ${passwordHash}, ${role === "admin"}, ${role})
    `

    revalidatePath("/manage-users")

    return {
      success: true,
      message: "User added successfully",
    }
  } catch (error) {
    console.error("Error adding user:", error)
    return {
      errors: {},
      message: "Failed to add user. Please try again.",
    }
  }
}

export async function updateUser(userId: number, prevState: any, formData: FormData) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return {
      errors: {},
      message: "Unauthorized",
    }
  }

  const validatedFields = UserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { name, email, role, password } = validatedFields.data

  try {
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email} 
      AND id != ${userId}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {},
        message: "A user with this email already exists",
      }
    }

    if (password) {
      const passwordHash = await bcryptjs.hash(password, 10)
      await sql`
        UPDATE users
        SET name = ${name},
            email = ${email},
            password_hash = ${passwordHash},
            is_admin = ${role === "admin"},
            role = ${role}
        WHERE id = ${userId}
        AND company_id = ${session.company_id}
      `
    } else {
      await sql`
        UPDATE users
        SET name = ${name},
            email = ${email},
            is_admin = ${role === "admin"},
            role = ${role}
        WHERE id = ${userId}
        AND company_id = ${session.company_id}
      `
    }

    revalidatePath("/manage-users")

    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      errors: {},
      message: "Failed to update user. Please try again.",
    }
  }
}

export async function deleteUser(userId: number) {
  const session = await getSession()

  if (!session || !session.is_admin) {
    return {
      success: false,
      message: "Unauthorized",
    }
  }

  try {
    await sql`
      DELETE FROM users
      WHERE id = ${userId}
      AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")

    return {
      success: true,
      message: "User deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      message: "Failed to delete user. Please try again.",
    }
  }
}

export async function getUsers() {
  const session = await getSession()

  if (!session) {
    return []
  }

  try {
    const users = await sql`
      SELECT id, name, email, role, is_admin, created_at
      FROM users
      WHERE company_id = ${session.company_id}
      ORDER BY created_at DESC
    `

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}
