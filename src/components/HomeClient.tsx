"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/app/lib/store";
import { removeHabit, addHabit, type Habit } from "@/src/app/lib/habitSlice";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function HomeClient() {
  const dispatch = useDispatch<AppDispatch>();
  const habits = useSelector((state: RootState) => state.habit.habits);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Habit | null>(null);

  const handleDelete = (habit: Habit) => {
    dispatch(removeHabit(habit.id));
    setRecentlyDeleted(habit);

    // Clear undo after 5 seconds
    setTimeout(() => {
      setRecentlyDeleted(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (recentlyDeleted) {
      const habitToRestore = {
        name: recentlyDeleted.name,
        goal: recentlyDeleted.goal,
        frequency: recentlyDeleted.frequency,
        specificDays: recentlyDeleted.specificDays || [],
        createdAt: recentlyDeleted.createdAt
      };
      dispatch(addHabit(habitToRestore));
      setRecentlyDeleted(null);
    }
  };

  return (
    
    <div className="mt-6 space-y-4">
        
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex justify-between items-center"
        >
            {/* console.log("Rendering HomePage") */}
          <div>
            <h2 className="text-lg font-semibold">{habit.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Goal: {habit.goal}</p>
          </div>
          <button
            onClick={() => handleDelete(habit)}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
            title="Delete Habit"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {recentlyDeleted && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded flex justify-between items-center">
          <span className="text-yellow-800">Deleted `{recentlyDeleted.name}``. Undo?</span>
          <button
            onClick={handleUndo}
            className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
