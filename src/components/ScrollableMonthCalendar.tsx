import { useState } from "react";
import type { Habit } from "@/src/app/lib/habitSlice";
import { useTheme } from "@/src/contexts/ThemeContext";
import { shouldDateBeFaded, isHabitDueToday } from "@/src/utils/habitUtils";

interface Props {
  habit: Habit;
}

export default function ScrollableMonthCalendar({ habit }: Props) {
  const created = new Date(habit.createdAt);
  const today = new Date();
  const { theme } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date(today));

  const goToPrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    if (prev >= created) setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    if (next <= today) setCurrentMonth(next);
  };

  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    // Fill initial empty cells
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const iso = date.toISOString().split("T")[0];
      const status = habit.statusByDate?.[iso];
      const shouldFade = shouldDateBeFaded(habit, iso, created);
      const isDue = isHabitDueToday(habit, iso);
      
      // Handle dates outside the valid range
      if (date < created || date > today) {
        const isOutsideRange = date < created ? 'before-creation' : 'future';
        days.push(
          <div
            key={d}
            className={`w-10 h-10 rounded-md flex items-center justify-center opacity-30 ${
              theme === 'dark' ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'
            }`}
            title={`${date.toDateString()} - ${isOutsideRange === 'before-creation' ? 'Before habit creation' : 'Future date'}`}
          >
            {d}
          </div>
        );
        continue;
      }

      // Determine background color based on status and fade state
      let bgColor = "";
      let opacity = "";
      
      if (status === "done") {
        bgColor = "bg-green-500 text-white shadow-sm";
        opacity = shouldFade ? "opacity-40" : "opacity-100";
      } else if (status === "rejected") {
        bgColor = "bg-red-500 text-white shadow-sm";
        opacity = shouldFade ? "opacity-40" : "opacity-100";
      } else if (status === "later") {
        bgColor = "bg-yellow-400 text-black shadow-sm";
        opacity = shouldFade ? "opacity-40" : "opacity-100";
      } else if (status === "paused") {
        bgColor = "bg-orange-500 text-white shadow-sm";
        opacity = shouldFade ? "opacity-40" : "opacity-100";
      } else {
        // No status - check if this date should be faded
        if (shouldFade) {
          bgColor = theme === 'dark' 
            ? "bg-gray-800 text-gray-600" 
            : "bg-gray-100 text-gray-400";
          opacity = "opacity-30";
        } else {
          bgColor = theme === 'dark'
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300";
          opacity = "opacity-100";
        }
      }

      const getDayStatusText = () => {
        if (status) return status.charAt(0).toUpperCase() + status.slice(1);
        if (shouldFade) return 'Not scheduled';
        if (!isDue) return 'Not due';
        return 'No activity';
      };

      days.push(
        <div
          key={d}
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer ${bgColor} ${opacity} ${
            !shouldFade && !status ? 'hover:scale-105' : ''
          }`}
          title={`${date.toDateString()} - ${getDayStatusText()}`}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevMonth}
          className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1) < created}
        >
          ← Prev
        </button>
        <h4 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <button
          onClick={goToNextMonth}
          className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > today}
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Sun</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Mon</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Tue</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Wed</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Thu</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Fri</div>
        <div className={`text-center font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>Sat</div>
        {generateMonthDays()}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Postponed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Paused</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No activity</span>
        </div>
      </div>
    </div>
  );
}
