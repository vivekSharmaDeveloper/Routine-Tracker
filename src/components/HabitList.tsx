'use client';

import React from 'react';
import { CalendarDays, Trash2, Check, X, Clock, Edit, Pause, Play, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState, AppDispatch } from '@/src/app/lib/store';
import {
  removeHabit,
  addHabit,
  toggleHabitCompletion,
  editHabit,
  setHabitStatus,
  completeHabit,
  pauseHabit
} from '@/src/app/lib/habitSlice';
import { isHabitDueToday, shouldDateBeFaded } from '@/src/utils/habitUtils';
import type { Habit } from '@/src/app/lib/habitSlice';
import ScrollableMonthCalendar from './ScrollableMonthCalendar';
import { handleClientError } from '@/src/lib/errors';
import { useToast } from '@/src/components/ui/Toast';
import AddHabitModal from '@/src/components/AddHabitModal';
import { Spinner } from '@/src/components/ui/Loading';
import { createPortal } from 'react-dom';

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitList(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const habits = useSelector((state: RootState) => state.habit.habits);
  const { success, warning, info } = useToast();
  const [recentlyDeleted, setRecentlyDeleted] = useState<Habit | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [calendarHabit, setCalendarHabit] = useState<Habit | null>(null);
  const [editHabitData, setEditHabitData] = useState<Habit | null>(null);
  
  // Edit modal state variables
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [editFrequency, setEditFrequency] = useState("daily");
  const [editSpecificDays, setEditSpecificDays] = useState<string[]>([]);
  const [editTwiceWeekDays, setEditTwiceWeekDays] = useState<number[]>([]);
  const [editSpecificDates, setEditSpecificDates] = useState<number[]>([]);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [editModalRoot, setEditModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    try {
      setToday(new Date());
    } catch (err) {
      console.error('Error setting today:', handleClientError(err));
    }
  }, []);

  const handleDelete = (habit: Habit) => {
    setRecentlyDeleted(habit);
    dispatch(removeHabit(habit.id));
    setTimeout(() => setRecentlyDeleted(null), 5000);
  };

  const handleUndo = () => {
    if (recentlyDeleted) {
      dispatch(addHabit(recentlyDeleted));
      setRecentlyDeleted(null);
    }
  };

  const handleToggleComplete = (habitId: string, date: string) => {
    dispatch(toggleHabitCompletion({ id: habitId, date }));
  };

  // Initialize edit modal with habit data
  const initializeEditModal = (habit: Habit) => {
    setEditHabitData(habit);
    setEditName(habit.name);
    setEditGoal(habit.goal);
    
    if (habit.frequency.type === 'weekly') {
      setEditFrequency('specific');
      setEditSpecificDays(habit.frequency.days?.map(d => weekdays[d]) || []);
    } else if (habit.frequency.type === 'twice-a-week') {
      setEditFrequency('twice');
      setEditTwiceWeekDays(habit.frequency.days || []);
    } else if (habit.frequency.type === 'custom-dates') {
      setEditFrequency('specificDate');
      setEditSpecificDates(habit.frequency.dates?.map(d => parseInt(d)) || []);
    } else if (habit.frequency.type === 'alternate') {
      setEditFrequency('alternate');
    } else {
      setEditFrequency('daily');
    }
    
    setEditSpecificDays([]);
    setEditTwiceWeekDays([]);
    setEditSpecificDates([]);
    setShowEditCalendar(false);
  };

  // Handle edit modal frequency change
  const handleEditFrequencyChange = (newFrequency: string) => {
    setEditFrequency(newFrequency);
    setEditSpecificDays([]);
    setEditTwiceWeekDays([]);
    setEditSpecificDates([]);
    setShowEditCalendar(false);
  };

  // Handle specific day change for edit modal
  const handleEditSpecificDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value;
    setEditSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Handle twice week day change for edit modal
  const handleEditTwiceWeekDayChange = (dayIndex: number) => {
    setEditTwiceWeekDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex);
      } else if (prev.length < 2) {
        return [...prev, dayIndex];
      }
      return prev; // Don't allow more than 2 days
    });
  };

  // Handle specific date toggle for edit modal
  const handleEditSpecificDateToggle = (date: number) => {
    setEditSpecificDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHabitData) return;

    let freqType: { type: "custom" | "daily" | "alternate" | "weekly" | "twice-a-week" | "custom-dates"; days?: number[]; dates?: string[] };
    if (editFrequency === "specific") {
      freqType = { type: "weekly" as const, days: editSpecificDays.map((day) => weekdays.indexOf(day)) };
    } else if (editFrequency === "alternate") {
      freqType = { type: "alternate" as const };
    } else if (editFrequency === "twice") {
      freqType = { type: "twice-a-week" as const, days: editTwiceWeekDays };
    } else if (editFrequency === "specificDate") {
      freqType = { type: "custom-dates" as const, dates: editSpecificDates.map(date => date.toString()) };
    } else {
      freqType = { type: "daily" as const };
    }

    const updatedHabit = {
      ...editHabitData,
      name: editName,
      goal: editGoal,
      frequency: freqType,
      specificDays: editFrequency === "specific" ? editSpecificDays : [],
    };

    dispatch(editHabit(updatedHabit));
    setEditHabitData(null);
    
    success(
      'Habit Updated! ✏️',
      `"${updatedHabit.name}" has been updated successfully.`,
      { duration: 4000 }
    );
  };

  // Handle habit status actions with toast notifications
  const handleHabitDone = (habit: Habit) => {
    dispatch(setHabitStatus({ id: habit.id, date: todayIso, status: 'done' }));
    success(
      'Habit Completed! 🎉',
      `Great job completing "${habit.name}"! Goal: ${habit.goal}`,
      { duration: 4000 }
    );
  };

  const handleHabitCancel = (habit: Habit) => {
    dispatch(setHabitStatus({ id: habit.id, date: todayIso, status: 'rejected' }));
    warning(
      'Habit Cancelled',
      `"${habit.name}" marked as cancelled for today. Goal: ${habit.goal}`,
      { duration: 4000 }
    );
  };

  const handleHabitLater = (habit: Habit) => {
    dispatch(setHabitStatus({ id: habit.id, date: todayIso, status: 'later' }));
    info(
      'Habit Postponed ⏰',
      `"${habit.name}" postponed for later today. Goal: ${habit.goal}`,
      { duration: 4000 }
    );
  };

  const handleHabitComplete = (habit: Habit) => {
    dispatch(completeHabit(habit.id));
    success(
      'Habit Completed Successfully! 🎉',
      `"${habit.name}" has been moved to your past habits. You can find it in the history page.`,
      { duration: 5000 }
    );
  };

  const handleHabitPause = (habit: Habit) => {
    dispatch(pauseHabit(habit.id));
    if (habit.isPaused) {
      success(
        'Habit Resumed ▶️',
        `"${habit.name}" has been resumed and will appear in due section when scheduled.`,
        { duration: 4000 }
      );
    } else {
      info(
        'Habit Paused ⏸️',
        `"${habit.name}" has been paused. It will still appear when due but with reduced visibility.`,
        { duration: 4000 }
      );
    }
  };

  if (!today) return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="text-blue-600 dark:text-blue-400" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading your habits...</p>
      </div>
    </div>
  );

  const todayIso = today.toISOString().split("T")[0];

  // Filter out completed habits from the main view
  const activeHabits = habits.filter(habit => !habit.isCompleted);
  
  // Separate habits by due status (including paused habits that are due)
  const dueHabits = activeHabits.filter(habit => isHabitDueToday(habit, todayIso));
  const notDueHabits = activeHabits.filter(habit => !isHabitDueToday(habit, todayIso));

  const renderHabitCard = (habit: Habit) => {
    const completedToday = habit.statusByDate?.[todayIso] === "done";
    const dueToday = isHabitDueToday(habit, todayIso);
    const createdAt = new Date(habit.createdAt);

    return (
      <div
        key={habit.id}
        className={`border p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 flex flex-col gap-4 ${
          completedToday ? "opacity-60" : ""
        } ${!dueToday ? "opacity-75 border-gray-300 dark:border-gray-600" : "border-blue-200 dark:border-blue-700"} ${
          habit.isPaused ? "opacity-50 bg-gray-50 dark:bg-gray-900" : ""
        }`}
      >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className={`text-lg font-semibold ${habit.isPaused ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    <span 
                      className="inline-block"
                      title={habit.name.length > 20 ? habit.name : undefined}
                    >
                      {habit.name.length > 20 ? `${habit.name.substring(0, 20)}...` : habit.name}
                    </span>
                    {habit.isPaused && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">Paused</span>}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Goal: 
                    <span 
                      className="inline-block"
                      title={habit.goal.length > 20 ? habit.goal : undefined}
                    >
                      {habit.goal.length > 20 ? `${habit.goal.substring(0, 20)}...` : habit.goal}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCalendarHabit(habit)}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                  title="View past streak"
                >
                  <CalendarDays size={18} />
                </button>
                <button
                  onClick={() => handleHabitPause(habit)}
                  className={`p-2 rounded-full transition ${
                    habit.isPaused 
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900' 
                      : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900'
                  }`}
                  title={habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
                >
                  {habit.isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={() => initializeEditModal(habit)}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  title="Edit Habit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(habit)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                  title="Delete Habit"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Habit Action Buttons */}
            {dueToday && !habit.isPaused && (
              <div className="flex gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleHabitDone(habit)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                  title="Mark as Done"
                >
                  <Check size={14} />
                  Done
                </button>
                <button
                  onClick={() => handleHabitCancel(habit)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                  title="Cancel for Today"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={() => handleHabitLater(habit)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-xs font-medium"
                  title="Do Later"
                >
                  <Clock size={14} />
                  Later
                </button>
                <button
                  onClick={() => handleHabitComplete(habit)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium"
                  title="Mark as Completed"
                >
                  <Check size={14} />
                  Complete
                </button>
              </div>
            )}



            {/* 7-day rolling view */}
            <div className="flex gap-2 justify-start">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - (6 - i));
                const isoDate = date.toISOString().split("T")[0];

                const status = habit.statusByDate?.[isoDate];
                const completed = status === "done";
                const rejected = status === "rejected";
                const later = status === "later";
                const shouldFade = shouldDateBeFaded(habit, isoDate, createdAt);

                const isDue =
                  date >= createdAt &&
                  date <= today &&
                  isHabitDueToday(habit, isoDate);

                // Determine styling based on status and fade state
                const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all duration-200";
                let colorClasses = "";
                let opacityClasses = "";
                
                if (completed) {
                  colorClasses = "bg-green-500 text-white border-green-600";
                  opacityClasses = shouldFade ? "opacity-40" : "opacity-100";
                } else if (rejected) {
                  colorClasses = "bg-red-500 text-white border-red-600";
                  opacityClasses = shouldFade ? "opacity-40" : "opacity-100";
                } else if (later) {
                  colorClasses = "bg-yellow-400 text-black border-yellow-500";
                  opacityClasses = shouldFade ? "opacity-40" : "opacity-100";
                } else {
                  if (shouldFade || !isDue) {
                    colorClasses = "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700";
                    opacityClasses = "opacity-30 cursor-not-allowed";
                  } else {
                    colorClasses = "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600";
                    opacityClasses = "opacity-100";
                  }
                }

                const getTooltipText = () => {
                  const dateStr = date.toDateString();
                  if (status) return `${dateStr} - ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                  if (shouldFade) return `${dateStr} - Not scheduled`;
                  if (!isDue) return `${dateStr} - Not due`;
                  return `${dateStr} - No activity`;
                };

                return (
                  <button
                    key={isoDate}
                    onClick={() => {
                      if (!isDue || shouldFade) return;
                      handleToggleComplete(habit.id, isoDate);
                    }}
                    disabled={!isDue || shouldFade}
                    className={`${baseClasses} ${colorClasses} ${opacityClasses}`}
                    title={getTooltipText()}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Show empty state when no habits exist */}
      {activeHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start building better habits today!
            </p>
            <div className="transform scale-110">
              <AddHabitModal buttonText="Add Your First Habit" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Due Today Section */}
          {dueHabits.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Due Today</h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm font-medium">
                  {dueHabits.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueHabits.map(renderHabitCard)}
              </div>
            </div>
          )}

          {/* Not Due Today Section */}
          {notDueHabits.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Not Due Today</h3>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
                  {notDueHabits.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notDueHabits.map(renderHabitCard)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Calendar Modal */}
      {calendarHabit && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {calendarHabit.name} - Streak Calendar
        </h3>
        <button
          onClick={() => setCalendarHabit(null)}
          className="text-gray-600 hover:text-black dark:text-gray-300"
        >
          ✕
        </button>
      </div>

      <ScrollableMonthCalendar habit={calendarHabit} />
    </div>
  </div>
)}

{editHabitData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-60">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md border dark:border-gray-700 shadow-xl">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Habit</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(editHabit(editHabitData));
          setEditHabitData(null);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Habit Name</label>
          <input
            type="text"
            value={editHabitData.name}
            onChange={(e) =>
              setEditHabitData({ ...editHabitData, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Goal</label>
          <input
            type="text"
            value={editHabitData.goal}
            onChange={(e) =>
              setEditHabitData({ ...editHabitData, goal: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
          <select
            value={editHabitData.frequency.type}
            onChange={(e) =>
              setEditHabitData({
                ...editHabitData,
                frequency: { ...editHabitData.frequency, type: e.target.value as 'custom' | 'daily' | 'alternate' | 'weekly' | 'twice-a-week' | 'custom-dates' },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
          >
            <option value="daily">Daily</option>
            <option value="alternate">Alternate Days</option>
            <option value="weekly">Specific Weekdays</option>
            <option value="custom">Custom Dates</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setEditHabitData(null)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Enhanced Undo Bar */}
      {recentlyDeleted && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-4 rounded-lg shadow-lg border border-gray-700 dark:border-gray-300 max-w-md mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    Habit Deleted
                  </p>
                  <p className="text-xs opacity-80">
                    &quot;{recentlyDeleted.name}&quot; was removed
                  </p>
                </div>
              </div>
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
              >
                Undo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
