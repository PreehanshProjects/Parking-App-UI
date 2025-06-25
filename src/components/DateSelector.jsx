import DatePicker from "react-datepicker";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
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

  return (
    <div className="px-6 my-10 flex justify-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-slate-50 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 relative">
        {/* Decorative Gradient Blur in Background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-2xl z-0" />

        <div className="relative z-10">
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
          <p className="text-sm text-gray-500 leading-snug">
            You can book any day within this month.
            <br className="hidden sm:block" />
            The next month becomes available during the final week.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DateSelector;
