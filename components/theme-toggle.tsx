"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get the theme that was set by the blocking script
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light"
    setTheme(currentTheme)
  }, [])

  const toggleTheme = () => {
    if (!mounted) return

    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    try {
      localStorage.setItem("theme", newTheme)
      document.documentElement.setAttribute("data-theme", newTheme)
    } catch (e) {
      console.error("Failed to save theme preference:", e)
    }
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="btn btn-circle btn-ghost w-10 h-10" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle btn-ghost"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  )
}
