"use client"

import { useFormState } from "react-dom"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [state, formAction, isPending] = useFormState(login, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
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
      <div>
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
      {state?.error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">{state.error}</div>
      )}
      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
