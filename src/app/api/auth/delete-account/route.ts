import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/src/lib/rateLimit'
import dbConnect from '@/src/app/lib/dbConnect'
import User from '@/src/app/models/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimiter = rateLimit({
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many delete account attempts. Please try again later.',
    })
    
    const rateLimitResponse = await rateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    
    // Validate input
    const result = deleteAccountSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { password } = result.data

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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      )
    }

    // Delete user account
    await User.findByIdAndDelete(user._id)

    console.log(`Account deleted for user: ${user.email}`)

    // Create response with success message
    const response = NextResponse.json({
      message: 'Account deleted successfully',
    })

    // Clear the auth token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })

    return response

  } catch (_error) {
    console.error('Delete account error:', _error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
