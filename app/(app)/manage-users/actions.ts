"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function fetchUsers() {
  const session = await getSession()
  if (!session) {
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

export async function addUser(formData: FormData) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string

  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email}
  `

  if (existingUser.length > 0) {
    throw new Error("Email already exists")
  }

  const hashedPassword = await hashPassword(password)

  await sql`
    INSERT INTO users (company_id, name, email, password_hash, role, is_admin)
    VALUES (${session.company_id}, ${name}, ${email}, ${hashedPassword}, ${role}, ${role === "admin"})
  `

  revalidatePath("/manage-users")
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string

  await sql`
    UPDATE users
    SET name = ${name}, email = ${email}, role = ${role}, is_admin = ${role === "admin"}
    WHERE id = ${userId} AND company_id = ${session.company_id}
  `

  revalidatePath("/manage-users")
}

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    throw new Error("Unauthorized")
  }

  if (session.user_id === Number.parseInt(userId)) {
    throw new Error("Cannot delete your own account")
  }

  await sql`
    DELETE FROM users
    WHERE id = ${userId} AND company_id = ${session.company_id}
  `

  revalidatePath("/manage-users")
}

export async function updateUserPassword(userId: string, password: string) {
  const session = await getSession()
  if (!session || !session.is_admin) {
    throw new Error("Unauthorized")
  }

  const hashedPassword = await hashPassword(password)

  await sql`
    UPDATE users
    SET password_hash = ${hashedPassword}
    WHERE id = ${userId} AND company_id = ${session.company_id}
  `

  revalidatePath("/manage-users")
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
