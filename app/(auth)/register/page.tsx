import Link from "next/link"
import RegisterForm from "./register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 text-white">
      <div className="w-full max-w-md p-8 bg-blue-900 rounded-lg shadow-lg">
        <Link href="/" className="block mb-6">
          <h1 className="text-3xl font-bold text-center hover:text-blue-400 transition-colors cursor-pointer">
            VisaPilot
          </h1>
        </Link>
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Create Account</h2>
        <RegisterForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-white">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
