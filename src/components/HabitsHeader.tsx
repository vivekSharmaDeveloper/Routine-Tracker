'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/app/lib/store';
import AddHabitModal from '@/src/components/AddHabitModal';
import UserProfile from '@/src/components/UserProfile';

interface HabitsHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function HabitsHeader({ user }: HabitsHeaderProps) {
  const habits = useSelector((state: RootState) => state.habit.habits);
  
  // Filter out completed habits from the main view
  const activeHabits = habits.filter(habit => !habit.isCompleted);
  const hasHabits = activeHabits.length > 0;

  return (
    <header className="flex justify-between items-center mb-6 relative z-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Habits</h1>
      
      {hasHabits && (
        <div className="flex items-center space-x-4">
          <AddHabitModal />
          <UserProfile user={user} />
        </div>
      )}
      
      {!hasHabits && (
        <div className="flex items-center">
          <UserProfile user={user} />
        </div>
      )}
    </header>
  );
}
