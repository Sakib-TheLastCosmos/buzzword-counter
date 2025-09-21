"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function DarkModeToggleButton() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Dark Mode:</span>
      <button
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors focus:outline-none"
      >
        {/* Circle */}
        <span
          className={`absolute top-0.5 left-0.5 w-7 h-7 bg-white dark:bg-gray-900 rounded-full shadow-md transform transition-transform ${
            isDark ? "translate-x-6" : "translate-x-0"
          }`}
        />
        {/* Optional icons */}
      </button>
    </div>
  )
}
