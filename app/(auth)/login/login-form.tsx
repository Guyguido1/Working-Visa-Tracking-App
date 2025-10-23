"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { loginUser } from "./actions"
import { AlertCircle } from "lucide-react"

const initialState = {
  errors: {},
  message: "",
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginUser, initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle redirect after successful login - Added null check
  useEffect(() => {
    if (state && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true)
    formAction(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {state.message && (
        <div
          className="bg-red-100 border border-red-400 px-4 py-3 rounded relative"
          style={{ color: "#b91c1c" }}
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" style={{ color: "#b91c1c" }} />
            <span style={{ color: "#b91c1c" }}>{state.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-black"
        />
        {state.errors?.email && (
          <p className="text-sm" style={{ color: "#dc2626" }}>
            {state.errors.email}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-black"
        />
        {state.errors?.password && (
          <p className="text-sm" style={{ color: "#dc2626" }}>
            {state.errors.password}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 text-white"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  )
}
