"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormState } from "react-dom"
import { registerCompanyAdmin, type RegisterFormState } from "./actions"
import { Eye, EyeOff } from "lucide-react"

const initialState: RegisterFormState = {}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerCompanyAdmin, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Handle successful registration
  useEffect(() => {
    if (state?.success && state?.message?.includes("Registration successful")) {
      const timer = setTimeout(() => {
        router.push("/login?success=true&message=Registration+successful.+Please+log+in.")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-4">
      {state?.errors?._form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <p>{state.errors._form[0]}</p>
        </div>
      )}

      {state?.success && state?.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
          <p>{state.message}</p>
        </div>
      )}

      <div className="flex flex-col space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`px-3 py-2 bg-white dark:bg-gray-700 border ${
            state?.errors?.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`}
          placeholder="Enter your full name"
        />
        {state?.errors?.name && <p className="text-xs text-red-500 mt-1">{state.errors.name[0]}</p>}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`px-3 py-2 bg-white dark:bg-gray-700 border ${
            state?.errors?.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`}
          placeholder="Enter your email address"
        />
        {state?.errors?.email && <p className="text-xs text-red-500 mt-1">{state.errors.email[0]}</p>}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Company Name
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          className={`px-3 py-2 bg-white dark:bg-gray-700 border ${
            state?.errors?.companyName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white`}
          placeholder="Enter your company name"
        />
        {state?.errors?.companyName && <p className="text-xs text-red-500 mt-1">{state.errors.companyName[0]}</p>}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`px-3 py-2 bg-white dark:bg-gray-700 border ${
              state?.errors?.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-white`}
            placeholder="Create a password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {state?.errors?.password && <p className="text-xs text-red-500 mt-1">{state.errors.password[0]}</p>}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            className={`px-3 py-2 bg-white dark:bg-gray-700 border ${
              state?.errors?.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:text-white`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {state?.errors?.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Register
        </button>
      </div>
    </form>
  )
}
