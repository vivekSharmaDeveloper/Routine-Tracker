import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';

// GET /api/user/last-login - Get user's last login timestamp
export async function GET() {
  try {
    const session = await getServerSession();
    
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
      lastLogin: user.lastLogin || new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Error fetching last login:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last login' },
      { status: 500 }
    );
  }
}

// POST /api/user/last-login - Update user's last login timestamp
export async function POST() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const currentTime = new Date().toISOString();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        lastLogin: currentTime,
        updatedAt: currentTime
      },
      { new: true, upsert: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to update last login' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lastLogin: user.lastLogin,
      success: true,
      message: 'Last login updated successfully'
    });

  } catch (error) {
    console.error('Error updating last login:', error);
    return NextResponse.json(
      { error: 'Failed to update last login' },
      { status: 500 }
    );
  }
}
