'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { CheckCircle } from 'lucide-react'
import { useToast } from '@/src/components/ui/Toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { success, error: showErrorToast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        showErrorToast('Error', data.error || 'Failed to send reset email')
        return
      }

      setIsSubmitted(true)
      success('Reset Email Sent', 'Check your email for password reset instructions')
    } catch {
      setError('Network error. Please try again.')
      showErrorToast('Network Error', 'Please check your connection and try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        {isSubmitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Check Your Email</h2>
            <p className="text-gray-600 mt-2 mb-6">
              We&apos;ve sent a password reset link to <span className="font-semibold text-indigo-600">{email}</span>.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <Link href="/">
                <div className="flex items-center justify-center space-x-2 mb-6 cursor-pointer">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">HabitWise</span>
                </div>
              </Link>
              <h2 className="text-2xl font-semibold text-gray-700">Forgot Your Password?</h2>
              <p className="text-gray-500">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 text-lg"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Remember your password?{" "}
              <Link href="/login">
                <span className="font-semibold text-indigo-600 hover:underline cursor-pointer">Sign in</span>
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
