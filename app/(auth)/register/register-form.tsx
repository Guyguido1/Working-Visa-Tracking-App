"use client"

import { useFormState } from "react-dom"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = {
  errors: {},
  message: "",
  success: false,
}

export function RegisterForm() {
  const [state, formAction] = useFormState(register, initialState)
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        router.push("/login")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
    <form action={formAction} className="space-y-6">
      {showSuccess && (
        <div className="rounded-md bg-green-900/30 p-4">
          <p className="text-sm text-green-200">Registration successful! Redirecting to login...</p>
        </div>
      )}

      <div>
        <Label htmlFor="name" className="text-white">
          Full Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.name[0]}</p>
        )}
      </div>

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
        <Label htmlFor="companyName" className="text-white">
          Company Name
        </Label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          autoComplete="organization"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.companyName && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.companyName[0]}</p>
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
          autoComplete="new-password"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-white">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 bg-white text-gray-900 border-gray-300"
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-200 bg-red-900/30 p-2 rounded">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.errors?._form && (
        <div className="rounded-md bg-red-900/30 p-4">
          <p className="text-sm text-red-200">{state.errors._form[0]}</p>
        </div>
      )}

      {state?.message && !state?.success && (
        <div className="rounded-md bg-red-900/30 p-4">
          <p className="text-sm text-red-200">{state.message}</p>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={showSuccess}>
        {showSuccess ? "Redirecting..." : "Register"}
      </Button>
    </form>
  )
}
