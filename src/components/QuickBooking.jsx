/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { quickBook } from "../api/booking";

function QuickBooking({ allBookings, userBookings, spots, onBookingComplete }) {
  const [weeks, setWeeks] = useState([]);
  const [days, setDays] = useState([]);
  const [prioritizeUnderground, setPrioritizeUnderground] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("current");

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const weekOrder = ["first", "second", "third", "fourth"];
  const weekOffsets = {
    first: 0,
    second: 7,
    third: 14,
    fourth: 21,
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const isFinalWeek = () => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    return currentDate >= lastDay - 6;
  };

  const getDateForWeekday = (weekKey, dayIndex) => {
    let baseMonth = selectedMonth === "current" ? currentMonth : currentMonth + 1;
    let baseYear = currentYear;

    if (baseMonth > 11) {
      baseMonth %= 12;
      baseYear += 1;
    }

    const firstOfMonth = new Date(baseYear, baseMonth, 1);
    const firstDayOfWeek = firstOfMonth.getDay(); // Sunday = 0

    const firstMondayOffset = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek) % 7;
    const firstMonday = new Date(baseYear, baseMonth, 1 + firstMondayOffset);

    const weekIndex = weekOrder.indexOf(weekKey);
    const startOfWeek = new Date(firstMonday);
    startOfWeek.setDate(firstMonday.getDate() + weekIndex * 7);

    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);

    return targetDate;
  };

  const isAlreadyBooked = (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    return userBookings.some(
      (booking) => new Date(booking.date).toLocaleDateString("en-CA") === dateStr
    );
  };

  const isParkingAvailable = (date) => {
    const dateStr = date.toLocaleDateString("en-CA");
    const totalSpots = spots.length;
    const bookedCount = allBookings.filter(
      (booking) => new Date(booking.date).toLocaleDateString("en-CA") === dateStr
    ).length;
    return bookedCount < totalSpots;
  };

  const isWeekDisabled = (weekKey) => {
    if (selectedMonth !== "current") return false;

    // Disable only if all days are in the past
    for (let i = 0; i < 5; i++) {
      const date = getDateForWeekday(weekKey, i);
      if (date >= today) return false;
    }
    return true;
  };

  const isDayDisabled = (day) => {
    if (!weeks.length) return true;

    const dayIndex = weekdays.indexOf(day);

    // Check across all selected weeks
    return weeks.every((weekKey) => {
      const date = getDateForWeekday(weekKey, dayIndex);
      return (
        date < today ||
        isAlreadyBooked(date) ||
        !isParkingAvailable(date)
      );
    });
  };

  const getDayTooltip = (day) => {
    if (!weeks.length) return "";

    const dayIndex = weekdays.indexOf(day);
    const firstWeek = weeks[0];
    const date = getDateForWeekday(firstWeek, dayIndex);

    if (date < today) return "Date is in the past";
    if (isAlreadyBooked(date)) return "You have already booked this day";
    if (!isParkingAvailable(date)) return "No parking available";

    return "";
  };

  const handleToggleDay = (day) => {
    if (isDayDisabled(day)) return;
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleWeek = (week) => {
    if (isWeekDisabled(week)) return;
    setWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
    );
  };

  const getTargetDates = () => {
    const allDates = [];

    weeks.forEach((weekKey) => {
      weekdays.forEach((weekday, i) => {
        if (days.includes(weekday)) {
          allDates.push(getDateForWeekday(weekKey, i));
        }
      });
    });

    return allDates;
  };

  const handleQuickBooking = async () => {
    if (!days.length) {
      toast.error("Please select at least one day.");
      return;
    }
    if (!weeks.length) {
      toast.error("Please select at least one week.");
      return;
    }

    const targetDates = getTargetDates();

    const userBookedDates = new Set(
      userBookings.map((b) => new Date(b.date).toLocaleDateString("en-CA"))
    );

    const newDates = targetDates.filter((d) => {
      const dateStr = d.toLocaleDateString("en-CA");
      return !userBookedDates.has(dateStr) && isParkingAvailable(d);
    });

    if (newDates.length === 0) {
      toast.error("You've already booked parking on all selected days or no parking available.");
      return;
    }

    if (newDates.length < targetDates.length) {
      toast("Some dates were skipped because they are already booked or no parking available.", {
        icon: "⚠️",
      });
    }

    const dateStrings = newDates.map((d) => d.toLocaleDateString("en-CA"));
    setIsBooking(true);

    try {
      const results = await quickBook(dateStrings, prioritizeUnderground);
      onBookingComplete(results);
    } catch (err) {
      toast.error(err.message || "Quick booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  const monthLabels = {
    current: new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" }),
    next: new Date(currentYear, currentMonth + 1).toLocaleString("default", { month: "long" }),
  };

  return (
    <div className="px-6 my-10 flex justify-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-slate-50 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 relative min-h-[340px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 opacity-10 rounded-full blur-2xl z-0" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              🚀 Quick Booking
            </h2>
          </div>

          {isFinalWeek() && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Month</label>
              <div className="flex gap-2">
                {["current", "next"].map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMonth(key)}
                    className={`px-3 py-1 rounded-full border text-sm transition-all duration-150 ${
                      selectedMonth === key
                        ? "bg-purple-600 text-white border-purple-600"
                        : "text-gray-700 border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    {monthLabels[key]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Weeks</label>
            <div className="flex gap-2 flex-wrap">
              {weekOrder.map((weekKey) => (
                <button
                  key={weekKey}
                  onClick={() => handleToggleWeek(weekKey)}
                  disabled={isWeekDisabled(weekKey)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all duration-150 ${
                    weeks.includes(weekKey)
                      ? "bg-purple-500 text-white border-purple-500"
                      : "text-gray-700 border-gray-300 hover:border-purple-400"
                  } ${isWeekDisabled(weekKey) ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {weekKey.charAt(0).toUpperCase() + weekKey.slice(1)} Week
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  disabled={isDayDisabled(day)}
                  title={isDayDisabled(day) ? getDayTooltip(day) : ""}
                  className={`px-3 py-1 rounded-full border text-sm transition-all duration-150 ${
                    days.includes(day)
                      ? "bg-purple-500 text-white border-purple-500"
                      : "text-gray-700 border-gray-300 hover:border-purple-400"
                  } ${isDayDisabled(day) ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <input
              id="prioritizeUnderground"
              type="checkbox"
              checked={prioritizeUnderground}
              onChange={() => setPrioritizeUnderground((p) => !p)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="prioritizeUnderground" className="text-sm text-gray-700">
              Prioritize underground parking
            </label>
          </div>

          <button
            disabled={isBooking}
            onClick={handleQuickBooking}
            className={`w-full rounded-xl py-3 text-white font-semibold transition-colors duration-200 ${
              isBooking
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isBooking ? "Booking..." : "Quick Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickBooking;
