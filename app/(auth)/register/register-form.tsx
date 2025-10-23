"use client"

import { useFormState } from "react-dom"
import { register } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterForm() {
  const [state, formAction, isPending] = useFormState(register, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
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
      <div>
        <Label htmlFor="confirmPassword" className="text-white">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="bg-white text-gray-900 border-blue-700"
          disabled={isPending}
        />
      </div>
      {state?.error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">{state.error}</div>
      )}
      {state?.success && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">{state.success}</div>
      )}
      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
