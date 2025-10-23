import Link from "next/link"
import { CheckCircle, Shield, Users, Calendar } from "lucide-react"

export function SplashPage() {
  return (
    <div className="min-h-screen bg-blue-950 text-white">
      {/* Header */}
      <header className="bg-blue-900 shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">VisaPilot</h1>
          <nav className="space-x-4">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Simplify Your Visa Management</h2>
        <p className="text-xl text-blue-300 mb-8 max-w-2xl mx-auto">
          Track visa applications, manage deadlines, and stay organized with our powerful visa management platform.
        </p>
        <Link
          href="/register"
          className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-block"
        >
          Start Free Trial
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-blue-900 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose VisaPilot?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Easy Tracking</h4>
              <p className="text-blue-300">Monitor all visa applications in one centralized dashboard.</p>
            </div>
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Deadline Alerts</h4>
              <p className="text-blue-300">Never miss important dates with automated reminders.</p>
            </div>
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
              <p className="text-blue-300">Your data is encrypted and protected with enterprise-grade security.</p>
            </div>
            <div className="bg-blue-800 p-6 rounded-lg">
              <div className="bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Team Collaboration</h4>
              <p className="text-blue-300">Work together seamlessly with your team members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of organizations managing their visas efficiently.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-8">
        <div className="container mx-auto px-4 text-center text-blue-300">
          <p>&copy; 2025 VisaPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
