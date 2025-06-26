import DatePicker from "react-datepicker";
import { CalendarDaysIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

function DateSelector({ selectedDate, onDateChange }) {
  const today = new Date();

  const isDateSelectable = (date) => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const isCurrentMonth =
      date.getMonth() === currentMonth && date.getFullYear() === currentYear;

    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isInFinalWeek = today.getDate() >= lastDay - 6;

    const isNextMonth =
      isInFinalWeek &&
      date.getMonth() === currentMonth + 1 &&
      date.getFullYear() === currentYear;

    return isCurrentMonth || isNextMonth;
  };

  // Animated ticker texts
  const tickerMessages = [
    "Tip: Quick Booking saves you time ⏱️",
    "Did you know? You can book multiple days at once!",
    "Pro tip: Use the calendar icon for quick selections!",
  ];

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickerMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-6 my-10 flex justify-center">
      <div className="w-full max-w-2xl min-h-[420px] bg-gradient-to-br from-white to-slate-50 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 relative overflow-hidden">
        {/* Decorative Gradient Blur in Background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-2xl z-0" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Heading with Icon */}
          <div className="flex items-center space-x-3 mb-6">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Choose Your Parking Dates
            </h2>
          </div>

          {/* Date Picker Input */}
          <div className="relative mb-4">
            <DatePicker
              selected={selectedDate}
              onChange={onDateChange}
              filterDate={isDateSelectable}
              minDate={today}
              placeholderText="Select a date"
              popperClassName="z-50"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 text-gray-700 text-base shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
          </div>

          {/* Info Note */}
          <p className="text-sm text-gray-500 leading-snug mb-6">
            You can book any day within this month.
            <br className="hidden sm:block" />
            The next month becomes available during the final week.
          </p>

          {/* Animated Ticker */}
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm italic mb-6 select-none overflow-hidden">
            <svg
              className="h-5 w-5 animate-spin-slow"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v4m0 8v4m8-8h-4M4 12H0"
              />
            </svg>
            <span
              key={tickerIndex}
              className="transition-opacity duration-500 ease-in-out"
            >
              {tickerMessages[tickerIndex]}
            </span>
          </div>

          {/* Spacer to push the bottom glow bar down */}
          <div className="flex-grow" />

          {/* Modern bottom glow/gradient bar */}
          <div
            aria-hidden="true"
            className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-70 animate-pulse"
          />

          {/* Bouncing arrow hint */}
          <div className="flex justify-center mt-3">
            <span className="text-2xl animate-bounce">🚙</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DateSelector;
