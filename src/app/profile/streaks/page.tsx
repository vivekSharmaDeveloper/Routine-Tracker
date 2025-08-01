// app/profile/streaks/page.tsx
"use client"

import { useTheme } from "@/src/contexts/ThemeContext"

export default function StreaksPage() {
  const { theme } = useTheme()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Past Streaks</h1>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300">Display user habit streaks here (coming soon).</p>
        </div>
      </div>
    </div>
  )
}
