import type React from "react"
import Link from "next/link"
import { CheckCircle, Users, FileText, Calendar, Shield, Zap } from "lucide-react"

export function SplashPage() {
  return (
    <div className="min-h-screen bg-blue-950 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
            VisaPilot
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Simplify Your Visa Management</h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-200 max-w-3xl mx-auto">
          Track, manage, and never miss a visa deadline with our intuitive platform designed for immigration
          professionals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Register
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Everything You Need to Manage Visas
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="w-12 h-12 text-white" />}
            title="Client Management"
            description="Organize all your clients in one place with detailed profiles and document storage."
          />
          <FeatureCard
            icon={<Calendar className="w-12 h-12 text-white" />}
            title="Deadline Tracking"
            description="Never miss a visa expiration or renewal date with automatic reminders and notifications."
          />
          <FeatureCard
            icon={<FileText className="w-12 h-12 text-white" />}
            title="Document Management"
            description="Store and access all visa-related documents securely in the cloud."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-white" />}
            title="Secure & Compliant"
            description="Bank-level security to protect sensitive client information and maintain compliance."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-white" />}
            title="Automated Workflows"
            description="Streamline your processes with automated reminders and status updates."
          />
          <FeatureCard
            icon={<CheckCircle className="w-12 h-12 text-white" />}
            title="Real-time Updates"
            description="Stay informed with instant notifications about visa status changes and deadlines."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Streamline Your Visa Management?</h2>
          <p className="text-xl mb-8 text-blue-200 max-w-2xl mx-auto">
            Join immigration professionals who trust VisaPilot to manage their clients' visa applications and renewals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-8">
        <div className="container mx-auto px-4 text-center text-blue-200">
          <p>&copy; 2025 VisaPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-blue-900 p-6 rounded-lg">
      <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  )
}
