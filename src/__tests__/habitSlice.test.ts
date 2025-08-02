import habitReducer, { addHabit, removeHabit, toggleHabitCompletion, setHabitStatus, editHabit, completeHabit, pauseHabit, setStreakGoal, Habit } from '../app/lib/habitSlice'

import { REHYDRATE } from 'redux-persist'

describe('Habit Reducer', () => {
  const initialState = {
    habits: [],
    streakGoal: 80,
  }

  it('should handle adding a habit', () => {
    const habit: Omit<Habit, 'id' | 'completedDates' | 'statusByDate'> = {
      name: 'New Habit',
      goal: 'Example goal',
      frequency: { type: 'daily' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }
    const newState = habitReducer(initialState, addHabit(habit))
    expect(newState.habits.length).toBe(1)
    expect(newState.habits[0].name).toBe('New Habit')
  })

  it('should handle removing a habit', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'To Remove',
      goal: 'For removal',
      frequency: { type: 'weekly' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const removeID = addedState.habits[0].id
    const newState = habitReducer(addedState, removeHabit(removeID))
    expect(newState.habits.length).toBe(0)
  })

  it('should handle toggle habit completion', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'Toggle Habit',
      goal: 'Toggle Completion',
      frequency: { type: 'daily' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const toggleID = addedState.habits[0].id
    const newState = habitReducer(addedState, toggleHabitCompletion({ id: toggleID, date: '2025-08-01' }))
    expect(newState.habits[0].completedDates).toContain('2025-08-01')
  })

  it('should handle setting habit status', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'Status Habit',
      goal: 'Set Status',
      frequency: { type: 'weekly' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const statusID = addedState.habits[0].id
    const newState = habitReducer(addedState, setHabitStatus({ id: statusID, date: '2025-08-01', status: 'done' }))
    expect(newState.habits[0].statusByDate['2025-08-01']).toBe('done')
  })

  it('should handle editing a habit', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'Edit Habit',
      goal: 'Edit this goal',
      frequency: { type: 'custom' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const editID = addedState.habits[0].id
    const newGoal = 'Updated Goal'
    const newState = habitReducer(addedState, editHabit({ ...addedState.habits[0], goal: newGoal }))
    expect(newState.habits[0].goal).toBe(newGoal)
  })

  it('should handle completing a habit', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'Complete Habit',
      goal: 'Complete this goal',
      frequency: { type: 'alternate' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const completeID = addedState.habits[0].id
    const newState = habitReducer(addedState, completeHabit(completeID))
    expect(newState.habits[0].isCompleted).toBe(true)
  })

  it('should handle pausing a habit', () => {
    const addedState = habitReducer(initialState, addHabit({
      name: 'Pause Habit',
      goal: 'Pause goal',
      frequency: { type: 'twice-a-week' },
      specificDays: [],
      createdAt: new Date().toISOString(),
    }))
    const pauseID = addedState.habits[0].id
    const newState = habitReducer(addedState, pauseHabit(pauseID))
    expect(newState.habits[0].isPaused).toBe(true)
  })

  it('should handle setting streak goal', () => {
    const newStreakGoal = 85
    const newState = habitReducer(initialState, setStreakGoal(newStreakGoal))
    expect(newState.streakGoal).toBe(newStreakGoal)
  })

  it('should handle rehydration with initial state', () => {
    const rehydratedState = habitReducer(initialState, {
      type: REHYDRATE,
      payload: { habit: { ...initialState, habits: [{ id: 'test', name: 'Rehydrate', goal: 'Rehydrate this goal', createdAt: new Date().toISOString(), frequency: { type: 'daily' }, statusByDate: {}, completedDates: [] }] } },
    })
    expect(rehydratedState.habits.length).toBe(1)
  })
})

