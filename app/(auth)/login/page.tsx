import Link from "next/link"
import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md">
        <div className="bg-blue-950 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-blue-800">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-300">Sign in to your account</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
