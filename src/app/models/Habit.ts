import mongoose, { Schema, Document } from 'mongoose'

export interface IHabit extends Document {
  title: string
  description?: string
  frequency: 'daily' | 'weekly'
  startDate: Date
  completedDates: Date[]
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const HabitSchema: Schema = new Schema(
  {
    title: { 
        type: String, 
        required: true 
    },
    description: {
        type: String 
    },
    frequency: { 
        type: String, 
        enum: ['daily', 'weekly'], 
        default: 'daily' 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    completedDates: { 
        type: [Date], 
        default: [] 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
  },
  { timestamps: true }
)

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)
