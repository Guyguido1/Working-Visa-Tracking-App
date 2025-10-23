import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Users, FileText, Calendar, BarChart } from "lucide-react"

export function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-200 text-white">
      {/* Header */}
      <header className="border-b border-blue-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Visa Management System</h1>
          <nav className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-blue-300">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold text-white">Streamline Your Visa Management</h2>
          <p className="text-xl text-white">
            Track expiration dates, manage customer information, and stay ahead of deadlines with our comprehensive visa
            management platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="bg-blue-300 hover:bg-blue-400 text-white border-blue-400">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-300 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Customer Management</CardTitle>
                <CardDescription className="text-gray-100">
                  Organize and track all customer information in one place
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Expiration Tracking</CardTitle>
                <CardDescription className="text-gray-100">
                  Never miss a visa or passport expiration date
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Report Generation</CardTitle>
                <CardDescription className="text-gray-100">
                  Create detailed reports and track status updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                <CardDescription className="text-gray-100">
                  Get insights into your visa management workflow
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Multi-tenant Support</CardTitle>
                <CardDescription className="text-gray-100">Secure data isolation for each company</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-blue-300 border-blue-400 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-100">Add team members and manage permissions</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h3>
          <p className="text-xl mb-8 text-white">
            Join hundreds of companies managing their visa processes efficiently
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-300 py-8">
        <div className="container mx-auto px-4 text-center text-white">
          <p>&copy; 2025 Visa Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
