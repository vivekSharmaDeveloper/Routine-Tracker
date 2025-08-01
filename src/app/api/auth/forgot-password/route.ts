import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { passwordResetRateLimit } from '@/src/lib/rateLimit';
import { validateInput, passwordResetRequestSchema } from '@/src/lib/validations';
import { createErrorResponse } from '@/src/lib/errors';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await passwordResetRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateInput(passwordResetRequestSchema, body);
    const { email } = validatedData;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, we don't reveal if the email exists or not
      // But we still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiration (10 minutes)
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save reset token to user
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetTokenExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // In a real application, you would send an email here
    // For now, we'll just log it (remove in production)
    console.log('Password reset URL:', resetUrl);
    
    // Send password reset email
    try {
      const { sendPasswordResetEmail } = await import('@/src/lib/email');
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue execution - don't fail the request if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return createErrorResponse(error, 'Failed to process password reset request');
  }
}

