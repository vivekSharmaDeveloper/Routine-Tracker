// src/utils/habitUtils.ts
import { Habit } from "@/src/app/lib/habitSlice";

export function isHabitDueToday(habit: Habit, dateStr: string): boolean {
  const today = new Date(dateStr);
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

if (!habit.frequency || typeof habit.frequency !== "object" || !habit.frequency.type) {
    return true; // fallback to always due if frequency is invalid
  }

  switch (habit.frequency.type) {
    case "daily":
      return true;

    case "alternate": {
      const startDate = habit.completedDates.length
        ? new Date(habit.completedDates[0])
        : today;
      const diffDays = Math.floor(
        (today.getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)
      );
      return diffDays % 2 === 0;
    }

    case "weekly":
      return habit.frequency.days?.includes(dayOfWeek) ?? false;

    case "twice-a-week":
      return habit.frequency.days?.includes(dayOfWeek) ?? false;

    case "custom":
      return habit.frequency.dates?.includes(dateStr) ?? false;

    case "custom-dates": {
      const dayOfMonth = today.getDate();
      return habit.frequency.dates?.includes(dayOfMonth.toString()) ?? false;
    }

    default:
      return false;
  }
}

/**
 * Determines if a date should be faded (not relevant) based on habit frequency
 * @param habit The habit to check
 * @param dateStr The date string in ISO format
 * @param habitStartDate The date when the habit was created
 * @returns true if the date should be faded
 */
export function shouldDateBeFaded(habit: Habit, dateStr: string, habitStartDate: Date): boolean {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
  
  // Don't fade dates before habit creation
  if (date < habitStartDate) {
    return true;
  }
  
  // Don't fade future dates beyond today
  const today = new Date();
  if (date > today) {
    return true;
  }

  if (!habit.frequency || typeof habit.frequency !== "object" || !habit.frequency.type) {
    return false; // Don't fade if frequency is invalid
  }

  switch (habit.frequency.type) {
    case "daily":
      return false; // Never fade for daily habits

    case "alternate": {
      const diffDays = Math.floor(
        (date.getTime() - habitStartDate.getTime()) / (1000 * 3600 * 24)
      );
      return diffDays % 2 !== 0; // Fade non-alternate days
    }

    case "weekly":
    case "twice-a-week":
      return !habit.frequency.days?.includes(dayOfWeek); // Fade days not in the frequency

    case "custom":
      return !habit.frequency.dates?.includes(dateStr); // Fade dates not in custom dates

    case "custom-dates": {
      const dayOfMonth = date.getDate();
      return !habit.frequency.dates?.includes(dayOfMonth.toString()); // Fade dates not in custom day numbers
    }

    default:
      return false;
  }
}
