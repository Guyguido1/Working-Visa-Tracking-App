import Link from "next/link"
import RegisterForm from "./register-form"

export default function RegisterPage() {
  return (
    <div className="auth-page bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">VisaPilot</h1>
          <p className="mt-2 text-sm text-gray-600">Create your company account</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <RegisterForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
