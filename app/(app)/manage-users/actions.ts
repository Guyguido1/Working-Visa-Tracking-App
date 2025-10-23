"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { getSession } from "@/app/actions/session"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"], { required_error: "Role is required" }),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export type UserFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    role?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export async function fetchCompanyName(): Promise<string> {
  const session = await getSession()
  if (!session) {
    return "Unknown Company"
  }

  const companies = await sql`
    SELECT name FROM companies WHERE id = ${session.company_id}
  `

  return companies.length > 0 ? companies[0].name : "Unknown Company"
}

export async function fetchUsers() {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  const users = await sql`
    SELECT id, name, email, role, is_admin
    FROM users
    WHERE company_id = ${session.company_id}
    ORDER BY name ASC
  `

  return users
}

export async function addUser(prevState: UserFormState | undefined, formData: FormData): Promise<UserFormState> {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return {
      errors: {
        _form: ["Unauthorized"],
      },
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
    }
  }

  const { name, email, role, password } = validatedFields.data

  if (!password) {
    return {
      errors: {
        password: ["Password is required"],
      },
    }
  }

  try {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["Email already exists"],
        },
      }
    }

    const passwordHash = await hashPassword(password)

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
      errors: {
        _form: ["Failed to add user"],
      },
    }
  }
}

export async function updateUser(
  userId: string,
  prevState: UserFormState | undefined,
  formData: FormData,
): Promise<UserFormState> {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return {
      errors: {
        _form: ["Unauthorized"],
      },
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
    }
  }

  const { name, email, role, password } = validatedFields.data

  try {
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `

    if (existingUsers.length > 0) {
      return {
        errors: {
          email: ["Email already exists"],
        },
      }
    }

    if (password) {
      const passwordHash = await hashPassword(password)
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, role = ${role}, is_admin = ${role === "admin"}, password_hash = ${passwordHash}
        WHERE id = ${userId} AND company_id = ${session.company_id}
      `
    } else {
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, role = ${role}, is_admin = ${role === "admin"}
        WHERE id = ${userId} AND company_id = ${session.company_id}
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
      errors: {
        _form: ["Failed to update user"],
      },
    }
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || !session.is_admin) {
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
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function updateUserPassword(
  userId: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || !session.is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const passwordHash = await hashPassword(newPassword)

    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${userId} AND company_id = ${session.company_id}
    `

    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { success: false, error: "Failed to update password" }
  }
}
