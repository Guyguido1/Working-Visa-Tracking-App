"use server"

import { sql } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { createSession } from "@/app/actions/session"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  message?: string
  redirectTo?: string
}

export async function loginUser(prevState: LoginFormState | undefined, formData: FormData): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  const { email, password } = validatedFields.data

  try {
    const users = await sql`
      SELECT id, email, password_hash, company_id, is_admin, role, name
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
        message: "Invalid email or password",
      }
    }

    const user = users[0]

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
        message: "Invalid email or password",
      }
    }

    await createSession(user.id, user.company_id)

    return {
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      errors: {
        _form: ["An error occurred during login. Please try again."],
      },
      message: "An error occurred during login. Please try again.",
    }
  }
}
