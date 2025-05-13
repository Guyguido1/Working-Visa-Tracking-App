"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, UserPlus, Users, UserCog, LogOut, Menu, X } from "lucide-react"
import ThemeToggle from "./theme-toggle"
import { logout } from "@/app/actions/auth"
import { getCurrentUser } from "@/app/actions/session"
import { fetchCompanyName } from "@/app/(app)/manage-users/actions"

export default function Sidebar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [companyName, setCompanyName] = useState("Visa Manager")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserSession() {
      try {
        const user = await getCurrentUser()

        // Add safety check for user object
        if (!user) {
          console.error("User session not found")
          setIsAdmin(false)
          return
        }

        // Check if user is an error object
        if (typeof user === "object" && "success" in user && !user.success) {
          console.error("Error in user session:", user)
          setError("Session error")
          setIsAdmin(false)
          return
        }

        setIsAdmin(user?.is_admin === true || user?.role === "admin")

        // Fetch company name with error handling
        try {
          const result = await fetchCompanyName()
          if (result.success) {
            setCompanyName(result.name)
          } else {
            console.error("Failed to fetch company name:", result.error)
            setCompanyName("Unknown Company")
          }
        } catch (companyError) {
          console.error("Error fetching company name:", companyError)
          setCompanyName("Visa Manager")
        }
      } catch (error) {
        console.error("Error loading user session:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserSession()
  }, [pathname]) // Reload when path changes (e.g., after login/logout)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Base navigation items that all users can see
  const baseNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/add-customer", label: "Add Customer", icon: <UserPlus className="w-5 h-5" /> },
    { href: "/customers", label: "Customer Management", icon: <Users className="w-5 h-5" /> },
  ]

  // Admin-only navigation item
  const adminNavItem = {
    href: "/manage-users",
    label: "Manage Users",
    icon: <UserCog className="w-5 h-5" />,
  }

  // Combine navigation items based on admin status
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems

  // If there's an error, show a simplified sidebar
  if (error) {
    return (
      <div className="fixed top-0 left-0 h-full w-64 bg-base-200 text-base-content p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Error</h1>
          <ThemeToggle />
        </div>
        <p className="text-red-500">{error}</p>
        <form action={logout} className="mt-4">
          <button type="submit" className="flex items-center w-full p-2 rounded hover:bg-base-300">
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="btn btn-circle btn-primary"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className="drawer lg:hidden">
        <input
          id="my-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isSidebarOpen}
          onChange={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="drawer-side z-40">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
            onClick={toggleSidebar}
          ></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <div className="flex items-center justify-between p-4 mb-6">
              <h1 className="text-xl font-bold">{companyName}</h1>
              <ThemeToggle />
            </div>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={pathname === item.href ? "active" : ""} onClick={toggleSidebar}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <form action={logout}>
                <button type="submit" className="flex items-center w-full">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </form>
            </li>
          </ul>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-64 bg-base-200 text-base-content overflow-y-auto">
        <div className="flex items-center justify-between p-4 mb-6">
          <h1 className="text-xl font-bold">{companyName}</h1>
          <ThemeToggle />
        </div>
        <ul className="menu menu-lg p-4 space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={pathname === item.href ? "active" : ""}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <form action={logout}>
              <button type="submit" className="flex items-center w-full">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </form>
          </li>
        </ul>
      </div>
    </>
  )
}
