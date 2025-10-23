import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">VisaPilot</h1>
        <p className="text-xl text-gray-700">Get Started</p>
        <p className="text-sm text-gray-600">Create your company account</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">Register your company to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
