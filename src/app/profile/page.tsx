"use client"

import { useSession } from "next-auth/react"
import { useTheme } from "@/src/contexts/ThemeContext"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { theme } = useTheme()

  if (!session) return <p className="text-gray-700 dark:text-gray-300">Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">User Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Full Name</p>
              <p className="text-gray-900 dark:text-gray-100 font-semibold">{session.user?.name || 'Not provided'}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Email Address</p>
            <p className="text-gray-900 dark:text-gray-100 font-semibold">{session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
