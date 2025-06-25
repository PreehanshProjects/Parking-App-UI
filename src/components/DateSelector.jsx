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
    <div className="px-6 mb-8 my-8">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <label className="block text-base font-semibold text-gray-800 mb-3">
          📆 Choose Your Parking Date
        </label>

        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            filterDate={isDateSelectable}
            minDate={today}
            placeholderText="Select a date"
            className="w-full pl-12 pr-4 py-3 rounded-md border border-gray-300 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          />
          <CalendarDaysIcon className="h-6 w-6 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <p className="text-sm text-gray-500 mt-3 leading-snug">
          You can book any day within this month.
          <br />
          The next month becomes available during the final week.
        </p>
      </div>
    </div>
  );
}

export default DateSelector;
