import { isHabitDueToday, shouldDateBeFaded } from '../utils/habitUtils'
import { Habit } from '../app/lib/habitSlice'

describe('Habit Utils', () => {
  const mockHabit: Habit = {
    id: '1',
    name: 'Test Habit',
    goal: 'Test Goal',
    completedDates: [],
    statusByDate: {},
    createdAt: '2025-01-01T00:00:00.000Z',
    frequency: { type: 'daily' },
  }

  describe('isHabitDueToday', () => {
    it('should return true for daily habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'daily' as const },
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(true)
    })

    it('should return correct result for weekly habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'weekly' as const, days: [1, 3, 5] }, // Mon, Wed, Fri
      }
      expect(isHabitDueToday(habit, '2025-08-04')).toBe(true) // Monday
      expect(isHabitDueToday(habit, '2025-08-05')).toBe(false) // Tuesday
      expect(isHabitDueToday(habit, '2025-08-06')).toBe(true) // Wednesday
    })

    it('should return correct result for twice-a-week habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'twice-a-week' as const, days: [2, 4] }, // Tue, Thu
      }
      expect(isHabitDueToday(habit, '2025-08-05')).toBe(true) // Tuesday
      expect(isHabitDueToday(habit, '2025-08-07')).toBe(true) // Thursday
      expect(isHabitDueToday(habit, '2025-08-06')).toBe(false) // Wednesday
    })

    it('should return correct result for alternate habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'alternate' as const },
        completedDates: ['2025-08-01'],
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(true) // Start date
      expect(isHabitDueToday(habit, '2025-08-02')).toBe(false) // Next day
      expect(isHabitDueToday(habit, '2025-08-03')).toBe(true) // Alternate day
    })

    it('should return correct result for custom date habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'custom' as const, dates: ['2025-08-01', '2025-08-15'] },
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(true)
      expect(isHabitDueToday(habit, '2025-08-15')).toBe(true)
      expect(isHabitDueToday(habit, '2025-08-10')).toBe(false)
    })

    it('should return correct result for custom-dates habits (day of month)', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'custom-dates' as const, dates: ['1', '15', '30'] },
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(true) // 1st of month
      expect(isHabitDueToday(habit, '2025-08-15')).toBe(true) // 15th of month
      expect(isHabitDueToday(habit, '2025-08-10')).toBe(false) // 10th of month
    })

    it('should return true for invalid frequency as fallback', () => {
      const habit = {
        ...mockHabit,
        frequency: null as any,
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(true)
    })

    it('should return false for unknown frequency type', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'unknown' as any },
      }
      expect(isHabitDueToday(habit, '2025-08-01')).toBe(false)
    })
  })

  describe('shouldDateBeFaded', () => {
    const habitStartDate = new Date('2025-08-01')

    it('should fade dates before habit creation', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'daily' as const },
      }
      expect(shouldDateBeFaded(habit, '2025-07-31', habitStartDate)).toBe(true)
    })

    it('should fade future dates', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'daily' as const },
      }
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      expect(shouldDateBeFaded(habit, futureDate.toISOString().split('T')[0], habitStartDate)).toBe(true)
    })

    it('should not fade daily habits for valid dates', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'daily' as const },
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false)
    })

    it.skip('should fade non-alternate days for alternate habits', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'alternate' as const },
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false) // Start date (day 0)
      expect(shouldDateBeFaded(habit, '2025-08-02', habitStartDate)).toBe(true) // Next day (day 1, should be faded)
      expect(shouldDateBeFaded(habit, '2025-08-03', habitStartDate)).toBe(false) // Day 2 (alternate day)
    })

    it.skip('should fade days not in weekly frequency', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'weekly' as const, days: [0, 2, 4] }, // Sun, Tue, Thu
      }
      expect(shouldDateBeFaded(habit, '2025-08-03', habitStartDate)).toBe(false) // Sunday (day 0)
      expect(shouldDateBeFaded(habit, '2025-08-04', habitStartDate)).toBe(true) // Monday (should be faded)
    })

    it('should fade dates not in custom frequency', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'custom' as const, dates: ['2025-08-01', '2025-08-15'] },
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false)
      expect(shouldDateBeFaded(habit, '2025-08-10', habitStartDate)).toBe(true) // Should be faded
    })

    it('should fade dates not in custom-dates frequency', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'custom-dates' as const, dates: ['1', '15'] },
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false) // 1st of month
      expect(shouldDateBeFaded(habit, '2025-08-10', habitStartDate)).toBe(true) // 10th of month (should be faded)
    })

    it('should not fade for invalid frequency', () => {
      const habit = {
        ...mockHabit,
        frequency: null as any,
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false)
    })

    it('should not fade for unknown frequency type', () => {
      const habit = {
        ...mockHabit,
        frequency: { type: 'unknown' as any },
      }
      expect(shouldDateBeFaded(habit, '2025-08-01', habitStartDate)).toBe(false)
    })
  })
})
