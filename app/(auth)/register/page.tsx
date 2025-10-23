import RegisterForm from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-950 text-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">VisaPilot</h1>
          <h2 className="text-xl font-medium text-white mb-2">Manage Your Visa Clients with Clarity & Confidence</h2>
          <p className="text-white">A secure, all-in-one platform for visa agencies to track customers</p>
        </div>

        <div className="bg-blue-900 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-white">Register Company Admin</h3>
          <RegisterForm />
          <div className="text-center mt-4">
            <p className="text-sm text-white">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
