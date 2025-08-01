import dbConnect from '@/src/app/lib/dbConnect'
import Habit from '@/src/app/models/Habit'
import { verifyToken } from '@/src/app/lib/auth'

export async function POST(req: Request) {
  await dbConnect()

  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    return new Response(JSON.stringify(
        { 
            error: 'Unauthorized'
        }), 
        { 
            status: 401 
        })
  }

  try {
    const user = verifyToken(token) as { userId: string }
    if (!user.userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const { title, description, frequency, startDate } = await req.json()

    if (!title || !startDate) {
      return new Response(JSON.stringify(
        { 
            error: 'Title and start date are required' 
        }), 
        { 
            status: 400 

        })
    }

    const habit = await Habit.create({
      title,
      description,
      frequency,
      startDate,
      userId: user.userId,
      completedDates: []
    })

    return new Response(JSON.stringify(
        { 
            message: 'Habit created', habit 
        }), 
        { 
            status: 201 
        })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify(
        { 
            error: 'Something went wrong',
            message:"Token is not available"
        }), 
        { 
            status: 500 
        })
  }
}
