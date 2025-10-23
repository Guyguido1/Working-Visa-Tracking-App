import Link from "next/link"
import RegisterForm from "./register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white hover:text-blue-400 transition-colors">
            VisaPilot
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Create your account</h2>
        </div>

        <div className="bg-blue-900 py-8 px-6 shadow-lg rounded-lg">
          <RegisterForm key={Date.now()} />

          <div className="mt-4 text-center">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              Already have an account? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
