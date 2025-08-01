import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { comparePassword, generateToken } from '@/src/app/lib/auth';
import { userLoginSchema, validateInput } from '@/src/lib/validations';
import { createErrorResponse } from '@/src/lib/errors';
import { authRateLimit } from '@/src/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();
    const body = await req.json();

    // Validate input
    const { email, password } = validateInput(userLoginSchema, body);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    // Generate token
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    return createErrorResponse(error, 'Error logging in');
  }
}
