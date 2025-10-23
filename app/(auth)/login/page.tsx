import Link from "next/link"
import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-bold text-white mb-3">VisaPilot</h1>
          </Link>
          <h2 className="text-xl font-medium text-white mb-2">Manage Your Visa Clients with Clarity & Confidence</h2>
          <p className="text-white">A secure, all-in-one platform for visa agencies to track customers</p>
        </div>

        <div className="bg-blue-900 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-white">Login</h3>
          <LoginForm />
          <div className="text-center mt-4">
            <p className="text-sm text-white">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
