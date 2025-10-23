"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "./actions"
import { useEffect } from "react"

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginUser, undefined)

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state?.redirectTo, router])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.email && <p className="mt-1 text-sm text-red-400">{state.errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.password && <p className="mt-1 text-sm text-red-400">{state.errors.password[0]}</p>}
      </div>

      {state?.message && (
        <div className="rounded-md bg-red-900 p-3">
          <p className="text-sm text-red-200">{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}
