import { RegisterForm } from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-200 text-white">
      <div className="w-full max-w-md space-y-8 bg-blue-300 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">Create your account</h2>
          <p className="mt-2 text-center text-sm text-white">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-900 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
