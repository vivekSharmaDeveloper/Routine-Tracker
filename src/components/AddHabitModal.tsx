"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { addHabit } from "@/src/app/lib/habitSlice";
import { AppDispatch } from "@/src/app/lib/store";
import { Calendar, X } from "lucide-react";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AddHabitModalProps {
  buttonText?: string;
}

export default function AddHabitModal({ buttonText = "+ Add Habit" }: AddHabitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [specificDays, setSpecificDays] = useState<string[]>([]);
  const [twiceWeekDays, setTwiceWeekDays] = useState<number[]>([]);
  const [specificDates, setSpecificDates] = useState<number[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  // Set up portal root on mount
  useEffect(() => {
    setModalRoot(document.body);
  }, []);

  const handleSpecificDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value;
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleTwiceWeekDayChange = (dayIndex: number) => {
    setTwiceWeekDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex);
      } else if (prev.length < 2) {
        return [...prev, dayIndex];
      }
      return prev; // Don't allow more than 2 days
    });
  };

  const handleSpecificDateToggle = (date: number) => {
    setSpecificDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createdAt = new Date().toISOString().split("T")[0];

    let freqType: { type: "custom" | "daily" | "alternate" | "weekly" | "twice-a-week" | "custom-dates"; days?: number[]; dates?: string[] };
    if (frequency === "specific") {
      freqType = { type: "weekly" as const, days: specificDays.map((day) => weekdays.indexOf(day)) };
    } else if (frequency === "alternate") {
      freqType = { type: "alternate" as const };
    } else if (frequency === "twice") {
      freqType = { type: "twice-a-week" as const, days: twiceWeekDays };
    } else if (frequency === "specificDate") {
      freqType = { type: "custom-dates" as const, dates: specificDates.map(date => date.toString()) };
    } else {
      freqType = { type: "daily" as const };
    }

    const newHabit = {
      name,
      goal,
      frequency: freqType,
      specificDays: frequency === "specific" ? specificDays : [],
      createdAt,
    };

    console.log("New Habit:", newHabit);
    dispatch(addHabit(newHabit));

    // Reset form
    setIsOpen(false);
    setName("");
    setGoal("");
    setFrequency("daily");
    setSpecificDays([]);
    setTwiceWeekDays([]);
    setSpecificDates([]);
    setShowCalendar(false);
  };

  const modalContent = isOpen && modalRoot ? (
    <div 
      className="fixed inset-0 z-[99999] bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full shadow-xl border dark:border-gray-700 max-h-[90vh] overflow-y-auto ${
        buttonText === "Add Your First Habit" 
          ? "max-w-3xl" 
          : "max-w-lg lg:max-w-xl"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Habit</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Habit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Daily Goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="alternate">Every Alternate Day</option>
                  <option value="twice">Twice a Week</option>
                  <option value="specific">Specific Days</option>
                  <option value="specificDate">Specific Date</option>
                </select>
              </div>
              {frequency === "twice" && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select exactly 2 days per week:</p>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day, index) => (
                      <label key={day} className={`flex items-center gap-1 p-2 border rounded cursor-pointer transition-colors ${
                        twiceWeekDays.includes(index) 
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-300' 
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          value={day}
                          checked={twiceWeekDays.includes(index)}
                          onChange={() => handleTwiceWeekDayChange(index)}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        {weekdaysShort[index]}
                      </label>
                    ))}
                  </div>
                  {twiceWeekDays.length === 2 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Selected: {twiceWeekDays.sort((a, b) => a - b).map(d => weekdaysShort[d]).join(', ')}</p>
                  )}
                  {twiceWeekDays.length > 0 && twiceWeekDays.length < 2 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Please select one more day</p>
                  )}
                </div>
              )}
              {frequency === "specific" && (
                <div className="flex flex-wrap gap-2 text-gray-700 dark:text-gray-300">
                  {weekdays.map((day) => (
                    <label key={day} className="flex items-center gap-1 p-2 border rounded cursor-pointer transition-colors border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        value={day}
                        checked={specificDays.includes(day)}
                        onChange={handleSpecificDayChange}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              )}
              {frequency === "specificDate" && (
                <div className="relative">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select specific dates of the month:</p>
                  <div className="flex flex-col items-center">
                    <button 
                      type="button" 
                      onClick={() => setShowCalendar(!showCalendar)} 
                      className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors group"
                    >
                      <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    </button>
                    {specificDates.length > 0 && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ {specificDates.length} date{specificDates.length > 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {specificDates.sort((a, b) => a - b).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  {showCalendar && (
                    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl border dark:border-gray-700 max-w-sm w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Dates</h3>
                          <button 
                            type="button" 
                            onClick={() => setShowCalendar(false)} 
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {weekdaysShort.map(day => (
                            <div key={day} className="font-bold text-gray-500 dark:text-gray-400 text-xs p-2">
                              {day}
                            </div>
                          ))}
                          {[...Array(31).keys()].map(i => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => handleSpecificDateToggle(i + 1)}
                              className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                                specificDates.includes(i + 1)
                                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md scale-105"
                                  : "bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:scale-105"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(false)}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`text-white px-6 py-3 rounded-lg transition-colors shadow-lg font-semibold ${
          buttonText === "Add Your First Habit" 
            ? "bg-indigo-600 hover:bg-indigo-700 text-lg" 
            : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2"
        }`}
      >
        {buttonText}
      </button>
      
      {modalContent && createPortal(modalContent, modalRoot!)}
    </>
  );
}
