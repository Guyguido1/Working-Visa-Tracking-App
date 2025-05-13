import Link from "next/link"
import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 auth-form">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Login</h1>
      <LoginForm />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
