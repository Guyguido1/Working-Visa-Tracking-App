"use client"

import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "./actions"

export function LoginForm() {
  const [state, formAction, isPending] = useFormState(loginUser, null)

  return (
    <form action={formAction} className="space-y-4 auth-form">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-900">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@company.com"
          required
          className="bg-white text-gray-900"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-900">
          Password
        </Label>
        <Input id="password" name="password" type="password" required className="bg-white text-gray-900" />
      </div>
      {state?.error && <div className="text-red-700 text-sm">{state.error}</div>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  )
}
