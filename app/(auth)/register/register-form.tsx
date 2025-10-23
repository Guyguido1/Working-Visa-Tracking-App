"use client"

import { useFormState } from "react-dom"
import { registerCompanyAdmin } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RegisterForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useFormState(registerCompanyAdmin, {})

  useEffect(() => {
    if (state?.success) {
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }, [state?.success, router])

  return (
    <form action={formAction} className="space-y-4 auth-form">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" type="text" placeholder="John Doe" required />
        {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" name="companyName" type="text" placeholder="Acme Inc." required />
        {state?.errors?.companyName && <p className="text-sm text-red-500">{state.errors.companyName[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        {state?.errors?.confirmPassword && <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>}
      </div>
      {state?.errors?._form && <p className="text-sm text-red-500">{state.errors._form[0]}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.message}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Registering..." : "Register"}
      </Button>
    </form>
  )
}
