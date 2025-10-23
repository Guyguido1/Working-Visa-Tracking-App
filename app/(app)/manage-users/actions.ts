"use server"

import { sql } from "@/lib/db"
import { hashPassword, getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AddUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["admin", "user"], { message: "Please select a role" }),
})

const UpdateUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "user"], { message: "Please select a role" }),
})

const UpdatePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export async function fetchCompanyName() {
  const session = await getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const companies = await sql`
    SELECT name FROM companies WHERE id = ${session.company_id}
  `

  return companies[0]?.name || "Unknown Company"
}

export async function fetchUsers() {
  const session = await getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const users = await sql`
    SELECT id, name, email, role, is_admin, created_at
    FROM users
    WHERE company_id = ${session.company_id}
    ORDER BY created_at DESC
  `

  return users
}

export async function addUser(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return {
      errors: {
        _form: ["You must be an admin to add users"],
      },
    }
  }

  const validatedFields = AddUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, role } = validatedFields.data

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["This email is already registered"],
        },
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    await sql`
      INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
      VALUES (${session.company_id}, ${name}, ${email}, ${passwordHash}, ${role === "admin"}, ${role})
    `

    revalidatePath("/manage-users")

    return { success: true }
  } catch (error) {
    console.error("Add user error:", error)
    return {
      errors: {
        _form: ["An error occurred while adding the user. Please try again."],
      },
    }
  }
}

export async function updateUser(userId: string, prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return {
      errors: {
        _form: ["You must be an admin to update users"],
      },
    }
  }

  const validatedFields = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, role } = validatedFields.data

  try {
    // Check if email is taken by another user
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["This email is already registered"],
        },
      }
    }

    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role}, is_admin = ${role === "admin"}
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")

    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return {
      errors: {
        _form: ["An error occurred while updating the user. Please try again."],
      },
    }
  }
}

export async function updateUserPassword(userId: string, prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return {
      errors: {
        _form: ["You must be an admin to update passwords"],
      },
    }
  }

  const validatedFields = UpdatePasswordSchema.safeParse({
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  try {
    const passwordHash = await hashPassword(password)

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    revalidatePath("/manage-users")

    return { success: true }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      errors: {
        _form: ["An error occurred while updating the password. Please try again."],
      },
    }
  }
}

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    throw new Error("You must be an admin to delete users")
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
    throw new Error("An error occurred while deleting the user")
  }
}
