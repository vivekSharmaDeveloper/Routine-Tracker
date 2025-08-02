import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/src/app/lib/dbConnect';
import Habit from '@/src/app/models/Habit';
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
    
    // Find user's habits (if there's a user relation in the Habit model)
    // For now, return empty array since we're using Redux for habit storage
    const habits = [];
    const totalCompleted = 0;
    const currentStreak = 0;

    return NextResponse.json({
      habits,
      totalCompleted,
      currentStreak,
    });

  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Create new habit logic here
    // This would integrate with your habit model if you decide to store habits in DB
    
    return NextResponse.json({
      message: 'Habit created successfully',
      habit: body
    });

  } catch (error) {
    return createErrorResponse(error, 'Failed to create habit');
  }
}
