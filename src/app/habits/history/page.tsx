'use client'

import { useState } from 'react'
import { Calendar, Clock, TrendingUp, Filter, Search, CalendarDays } from 'lucide-react';
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/app/lib/store';
import { removeHabit, addHabit } from '@/src/app/lib/habitSlice';
import { useToast } from '@/src/components/ui/Toast';
import { useTheme } from '@/src/contexts/ThemeContext';
import ScrollableMonthCalendar from '@/src/components/ScrollableMonthCalendar';
import type { Habit } from '@/src/app/lib/habitSlice';


export default function HabitsHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'ongoing' | 'paused'>('all')
  const [calendarHabit, setCalendarHabit] = useState<Habit | null>(null)
  const dispatch = useDispatch<AppDispatch>();
  const { success, warning } = useToast();
  const habits = useSelector((state: RootState) => state.habit.habits);
  const completedHabits = habits.filter(habit => habit.isCompleted);
  const { theme } = useTheme();

const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter;
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'completed') {
      matchesFilter = habit.isCompleted === true;
    } else if (filterStatus === 'ongoing') {
      matchesFilter = !habit.isCompleted && !habit.isPaused;
    } else if (filterStatus === 'paused') {
      // Show all paused habits regardless of due status
      matchesFilter = habit.isPaused === true;
    } else {
      matchesFilter = false;
    }
    
    console.log(`Habit "${habit.name}": search=${matchesSearch}, filter=${matchesFilter}, isPaused=${habit.isPaused}, status=${filterStatus}`);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    dispatch(removeHabit(habitId));
    warning(
      'Habit Deleted',
      `"${habitName}" has been permanently deleted from your history.`,
      { duration: 4000 }
    );
  };

  const handleRepeatHabit = (habit: any) => {
    const newHabit = {
      name: habit.name,
      goal: habit.goal,
      frequency: habit.frequency,
      specificDays: habit.specificDays || [],
      createdAt: new Date().toISOString()
    };
    dispatch(addHabit(newHabit));
    success(
      'Habit Repeated! 🔄',
      `"${habit.name}" has been added back to your active habits.`,
      { duration: 4000 }
    );
  };

  return (
    <main className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Habit History</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Track your past habits and analyze your progress</p>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input
                type="text"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Habits</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{habits.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedHabits.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {habits.filter(h => !h.isCompleted).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This Page</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredHabits.length} habits
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Habit History</h2>
          </div>

          <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredHabits.length === 0 ? (
              <div className="p-8 text-center">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No habits found matching your criteria.</p>
              </div>
            ) : (
              filteredHabits.map((habit) => (
                <div key={habit.id} className={`p-6 transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{habit.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          habit.isCompleted 
                            ? getStatusColor('completed')
                            : habit.isPaused 
                              ? getStatusColor('paused')
                              : getStatusColor('ongoing')
                        }`}>
                          {habit.isCompleted ? 'Completed' : habit.isPaused ? 'Paused' : 'Ongoing'}
                        </span>
                      </div>

                      <div className={`flex items-center space-x-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {habit.isCompleted && habit.completedAt && (
                          <span>
                            Completed On: {new Date(habit.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {habit.isPaused && habit.pausedAt && (
                          <span>
                            Paused On: {new Date(habit.pausedAt).toLocaleDateString()}
                          </span>
                        )}
                        {!habit.isCompleted && !habit.isPaused && (
                          <span>
                            Created On: {new Date(habit.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Goal: {habit.goal}
                        </span>
                      </div>

                    </div>

                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => setCalendarHabit(habit)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                        title="View habit streak calendar"
                      >
                        <CalendarDays size={18} />
                      </button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteHabit(habit.id, habit.name)}>Delete</Button>
                      <Button variant="outline" size="sm" onClick={() => handleRepeatHabit(habit)}>Repeat</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {calendarHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {calendarHabit.name} - Streak Calendar
              </h3>
              <button
                onClick={() => setCalendarHabit(null)}
                className={`hover:text-black ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            <ScrollableMonthCalendar habit={calendarHabit} />
          </div>
        </div>
      )}
    </main>
  )
}
