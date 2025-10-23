"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "./actions"
import { useEffect } from "react"

export default function RegisterForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(registerUser, undefined)

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state?.redirectTo, router])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-white">
          Company Name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.companyName && <p className="mt-1 text-sm text-red-400">{state.errors.companyName[0]}</p>}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.name && <p className="mt-1 text-sm text-red-400">{state.errors.name[0]}</p>}
      </div>

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
          autoComplete="new-password"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.password && <p className="mt-1 text-sm text-red-400">{state.errors.password[0]}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 block w-full px-5 py-2 border border-blue-800 rounded-md shadow-sm bg-blue-800 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.message && (
        <div className={`rounded-md p-3 ${state.redirectTo ? "bg-green-900" : "bg-red-900"}`}>
          <p className={`text-sm ${state.redirectTo ? "text-green-200" : "text-red-200"}`}>{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  )
}
