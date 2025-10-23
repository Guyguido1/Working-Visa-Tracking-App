import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">VisaPilot</h1>
        <p className="text-xl text-gray-700">Welcome Back</p>
        <p className="text-sm text-gray-600">Sign in to your account to continue</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Log in</CardTitle>
          <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
