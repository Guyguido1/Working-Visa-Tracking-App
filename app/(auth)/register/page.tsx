import { RegisterForm } from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 text-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            <h1 className="text-3xl font-bold text-white mb-2">VisaPilot</h1>
          </Link>
          <p className="text-blue-300">Create your account</p>
        </div>

        <div className="bg-blue-900 p-8 rounded-lg shadow-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
