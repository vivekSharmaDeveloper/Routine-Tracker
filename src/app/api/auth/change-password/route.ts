import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/src/lib/rateLimit'
import dbConnect from '@/src/app/lib/dbConnect'
import User from '@/src/app/models/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimiter = rateLimit({
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many password change attempts. Please try again later.',
    })
    
    const rateLimitResponse = await rateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    
    // Validate input
    const result = changePasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = result.data

    // Get session using NextAuth
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('../[...nextauth]/route')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Find user by email from session
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash the new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
    })

    console.log(`Password changed for user: ${user.email}`)

    return NextResponse.json({
      message: 'Password changed successfully',
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
