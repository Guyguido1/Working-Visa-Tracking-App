"use client"

import { useFormState } from "react-dom"
import { register, performRedirect } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import Link from "next/link"

const initialState = {
  success: false,
  error: "",
  message: "",
}

export function RegisterForm() {
  const [state, formAction, isPending] = useFormState(register, initialState)

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        performRedirect()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-white">
          Company Name
        </Label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          required
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-white">
          Full Name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
        <p className="text-sm text-blue-300">Must be at least 8 characters long</p>
      </div>

      {state.error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">{state.error}</div>
      )}

      {state.success && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">{state.message}</div>
      )}

      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isPending}>
        {isPending ? "Creating account..." : "Register"}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
          Already have an account? Sign in here
        </Link>
      </div>
    </form>
  )
}
