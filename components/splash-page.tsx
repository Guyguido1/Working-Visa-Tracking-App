import { CheckCircle, Clock, Calendar, Cake, Shield, Users, LayoutDashboard } from "lucide-react"

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-blue-50 text-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">VisaPilot</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Manage Your Visa Clients with <span className="text-blue-600">Clarity & Confidence</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-600">
          A secure, all-in-one platform for visa agencies to track customer statuses, reports, and expirations.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-3 rounded-md bg-blue-600 text-white font-medium text-lg hover:opacity-90 transition-opacity">
            Login
          </button>
          <button className="px-8 py-3 rounded-md bg-white text-blue-600 border-blue-200 font-medium text-lg border hover:opacity-90 transition-opacity">
            Register
          </button>
        </div>
      </section>

      {/* Features Sections in Two Columns */}
      <div className="flex flex-col md:flex-row">
        {/* How It Works Section */}
        <section className="bg-white py-16 w-full md:w-1/2">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <CheckCircle className="w-10 h-10 text-blue-600" />,
                  title: "Add customers",
                  description: "Easily add and manage your visa clients in one place",
                },
                {
                  icon: <Clock className="w-10 h-10 text-blue-600" />,
                  title: "Track visa + passport expiries",
                  description: "Never miss an important expiration date again",
                },
                {
                  icon: <Calendar className="w-10 h-10 text-blue-600" />,
                  title: "Monitor report deadlines",
                  description: "Stay on top of all reporting requirements",
                },
                {
                  icon: <Cake className="w-10 h-10 text-blue-600" />,
                  title: "See upcoming birthdays",
                  description: "Build client relationships with timely birthday greetings",
                },
              ].map((item, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">{item.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why VisaPilot Section */}
        <section className="py-16 w-full md:w-1/2 bg-blue-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Why VisaPilot</h2>
            <div className="space-y-6">
              {[
                {
                  icon: <Users className="w-8 h-8 text-blue-600" />,
                  title: "Built for visa agencies",
                  description:
                    "Designed specifically for the unique needs of visa consultants and immigration agencies",
                },
                {
                  icon: <Shield className="w-8 h-8 text-blue-600" />,
                  title: "Secure and multi-tenant",
                  description: "Keep your client data safe with our secure, isolated multi-tenant architecture",
                },
                {
                  icon: <LayoutDashboard className="w-8 h-8 text-blue-600" />,
                  title: "Designed for daily use",
                  description: "Intuitive interface that makes managing visa clients efficient and stress-free",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start p-4 rounded-lg bg-white">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">{item.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="bg-blue-600 py-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to streamline your visa management?</h2>
          <button className="px-8 py-3 rounded-md bg-white text-blue-600 font-medium text-lg hover:opacity-90 transition-opacity">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-blue-600">VisaPilot</span>
            </div>
            <div className="text-gray-600 text-sm">© {new Date().getFullYear()} VisaPilot. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
