import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { hashPassword } from '@/src/app/lib/auth';
import { userRegistrationSchema, validateInput } from '@/src/lib/validations';
import { createErrorResponse } from '@/src/lib/errors';
import { registrationRateLimit } from '@/src/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await registrationRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();
    const body = await req.json();

    // Validate input, including confirmPassword
    const { username, email, password } = validateInput(userRegistrationSchema, body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json({
      message: 'User registered successfully',
      userId: user._id,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse(error, 'Error registering user');
  }
}
