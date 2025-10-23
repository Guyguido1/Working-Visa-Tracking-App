"use client"

import { useFormState } from "react-dom"
import { login, performRedirect } from "./actions"
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

export function LoginForm() {
  const [state, formAction, isPending] = useFormState(login, initialState)

  useEffect(() => {
    if (state.success) {
      performRedirect()
    }
  }, [state.success])

  return (
    <form action={formAction} className="space-y-6">
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
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
      </div>

      {state.error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">{state.error}</div>
      )}

      {state.success && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">{state.message}</div>
      )}

      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center">
        <Link href="/register" className="text-blue-400 hover:text-blue-300 text-sm">
          Don't have an account? Register here
        </Link>
      </div>
    </form>
  )
}
