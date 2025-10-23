"use client"

import { useFormState } from "react-dom"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = {
  errors: {},
  message: "",
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state?.redirectTo, router])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-white">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <div className="rounded-md bg-red-900/30 p-4">
          <p className="text-sm text-red-200">{state.message}</p>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white">
        Sign in
      </Button>
    </form>
  )
}
