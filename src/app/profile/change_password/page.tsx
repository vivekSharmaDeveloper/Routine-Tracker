"use client"

import { useState } from "react"

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirm) {
      setMessage("New passwords do not match.")
      return
    }
    // Add backend logic later
    setMessage("Password updated successfully (mock).")
  }

  return (
    <form onSubmit={handleChange}>
      <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
      <div className="space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="border px-3 py-2 w-full"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="border px-3 py-2 w-full"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border px-3 py-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Password
        </button>
        {message && <p>{message}</p>}
      </div>
    </form>
  )
}
