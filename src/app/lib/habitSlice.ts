import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { REHYDRATE } from 'redux-persist'

export type FrequencyType = 
  | "daily"
  | "alternate"
  | "twice-a-week"
  | "weekly"
  | "custom"
  | "custom-dates";

type HabitStatus = "done" | "rejected" | "later" | "paused";

export type Habit = {
  id: string;
  name: string;
  goal: string;
  completedDates: string[];
   frequency: {
    type: 'daily' | 'alternate' | 'weekly' | 'custom' | 'twice-a-week' | 'custom-dates';
    days?: number[]; // for weekly: [0, 2, 4] → Sunday, Tuesday, Thursday
    dates?: string[]; // for custom calendar dates like "10", "15", etc.
  };
  specificDays?: string[];
  createdAt: string;
  statusByDate: { [date: string]: HabitStatus };
  isCompleted?: boolean;
  completedAt?: string;
  isPaused?: boolean;
  pausedAt?: string;
}

type HabitState = {
  habits: Habit[]
  streakGoal: number // Percentage goal for daily consistency streak (50-100)
}

const initialState: HabitState = {
  habits: [],
  streakGoal: 80, // Default 80% goal
}

export const habitSlice = createSlice({
  name: "habit",
  initialState,
  reducers: {
    // addHabit: (state, action) => {
    //   const id = Date.now().toString();
    //   state.habits.push({ id, ...action.payload });
    // },
    addHabit: (state, action: PayloadAction<{
  name: string;
  goal: string;
  frequency: {
    type: 'daily' | 'alternate' | 'weekly' | 'custom' | 'twice-a-week' | 'custom-dates';
    days?: number[];
    dates?: string[];
  };
  specificDays?: string[];
  createdAt: string;
}>) => {
  const newHabit: Habit = {
    id: Date.now().toString(),
    name: action.payload.name,
    goal: action.payload.goal,
    frequency: action.payload.frequency,
    specificDays: action.payload.specificDays || [],
    createdAt: action.payload.createdAt,
    completedDates: [],
    statusByDate: {},
  };
  state.habits.push(newHabit);
}
,
    removeHabit: (state, action) => {
  state.habits = state.habits.filter(habit => habit.id !== action.payload);
    },
    toggleHabitCompletion: (state, action: PayloadAction<{ id: string; date: string }>) => {
      const { id, date } = action.payload;
      const habit = state.habits.find((h) => h.id === id);
      if (habit) {
        const index = habit.completedDates.indexOf(date);
        if (index >= 0) {
          habit.completedDates.splice(index, 1); // Uncheck
        } else {
          habit.completedDates.push(date); // Check
        }
      }
    },
    setHabitStatus: (state, action: PayloadAction<{ id: string; date: string; status: HabitStatus }>) => {
  const { id, date, status } = action.payload;
  const habit = state.habits.find((h) => h.id === id);
  if (habit) {
    habit.statusByDate[date] = status;
  }
},
editHabit: (state, action: PayloadAction<Habit>) => {
  const index = state.habits.findIndex(h => h.id === action.payload.id);
  if (index !== -1) {
    state.habits[index] = { ...state.habits[index], ...action.payload };
  }
},
completeHabit: (state, action: PayloadAction<string>) => {
  const habit = state.habits.find(h => h.id === action.payload);
  if (habit) {
    habit.isCompleted = true;
    habit.completedAt = new Date().toISOString();
  }
},
pauseHabit: (state, action: PayloadAction<string>) => {
  const habit = state.habits.find(h => h.id === action.payload);
  if (habit) {
    habit.isPaused = !habit.isPaused;
    habit.pausedAt = habit.isPaused ? new Date().toISOString() : undefined;
  }
},
setStreakGoal: (state, action: PayloadAction<number>) => {
  state.streakGoal = Math.max(50, Math.min(100, action.payload)); // Ensure between 50-100
},
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      // Handle rehydration from persistence
      if (action.payload) {
        return {
          ...state,
          ...((action.payload as any).habit || {})
        }
      }
    })
  }
})

export const { addHabit, removeHabit, toggleHabitCompletion, setHabitStatus, editHabit, completeHabit, pauseHabit, setStreakGoal } = habitSlice.actions
export default habitSlice.reducer
