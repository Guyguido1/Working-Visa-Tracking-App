import RegisterForm from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Register Company Admin</h1>
      <RegisterForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
