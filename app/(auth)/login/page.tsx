import Link from "next/link"
import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white hover:text-blue-400 transition-colors">
            VisaPilot
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Sign in to your account</h2>
        </div>

        <div className="bg-blue-900 py-8 px-6 shadow-lg rounded-lg">
          <LoginForm key={Date.now()} />

          <div className="mt-4 text-center">
            <Link href="/register" className="text-blue-400 hover:text-blue-300 text-sm">
              Don't have an account? Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
