"use client"

import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerCompanyAdmin } from "./actions"

export function RegisterForm() {
  const [state, formAction, isPending] = useFormState(registerCompanyAdmin, null)

  return (
    <form action={formAction} className="space-y-4 auth-form">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-gray-900">
          Company Name
        </Label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          placeholder="Your Company Ltd"
          required
          className="bg-white text-gray-900"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminName" className="text-gray-900">
          Admin Name
        </Label>
        <Input
          id="adminName"
          name="adminName"
          type="text"
          placeholder="John Doe"
          required
          className="bg-white text-gray-900"
        />
      </div>
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
      {state?.success && <div className="text-green-700 text-sm">Registration successful! Redirecting...</div>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
