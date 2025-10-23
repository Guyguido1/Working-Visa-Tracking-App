"use client"

import { useFormState } from "react-dom"
import { loginUser } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useFormState(loginUser, undefined)

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state?.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4 auth-form">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
      </div>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}
