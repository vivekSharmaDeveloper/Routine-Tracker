import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { createErrorResponse } from '@/src/lib/errors';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.avatar,
      joinedDate: user.createdAt,
      profileImage: user.avatar,
      lastLogin: user.lastLogin,
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    // For profile updates, we'll only accept username changes for now
    const { username } = body;
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { name: username || session.user.name },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.avatar,
      joinedDate: user.createdAt,
      profileImage: user.avatar,
      lastLogin: user.lastLogin,
    });

  } catch (error) {
    return createErrorResponse(error, 'Failed to update user data');
  }
}
