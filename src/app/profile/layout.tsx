"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { signOut } from 'next-auth/react'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/profile"
              className={pathname === "/profile" ? "text-blue-600 font-medium" : ""}
            >
              User Info
            </Link>
          </li>
          <li>
            <Link
              href="/profile/streaks"
              className={pathname === "/profile/streaks" ? "text-blue-600 font-medium" : ""}
            >
              Past Streaks
            </Link>
          </li>
          <li>
            <Link
              href="/profile/change-password"
              className={pathname === "/profile/change-password" ? "text-blue-600 font-medium" : ""}
            >
              Change Password
            </Link>
          </li>
          <li>
            <button onClick={() => signOut()} className="text-red-500">Logout</button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white">
        {children}
      </main>
    </div>
  )
}
