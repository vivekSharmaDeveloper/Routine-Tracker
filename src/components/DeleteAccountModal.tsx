'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useToast } from '@/src/components/ui/Toast'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { success, error: showErrorToast } = useToast()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Password is required')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        success('Account Deleted', 'Your account has been permanently deleted')
        
// Clear local storage
        localStorage.clear()
        sessionStorage.clear()

        // Logout using next-auth
        const { signOut } = await import('next-auth/react')
        await signOut({ redirect: false })
        
        // Close modal and redirect
        onClose()
        router.push('/login')
      } else {
        setError(data.error || 'Failed to delete account')
        showErrorToast('Error', data.error || 'Failed to delete account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      showErrorToast('Network Error', 'Please check your connection and try again')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setPassword('')
      setError('')
      setShowPassword(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Delete Account
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200 mb-2">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            All your habits, progress data, and account information will be permanently deleted.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Please enter your password to confirm
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                disabled={isDeleting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isDeleting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isDeleting || !password.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteAccountModal
