/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { quickBook } from "../api/booking";
import {
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  isBefore,
  isSameMonth,
  isWithinInterval,
  format,
} from "date-fns";

function QuickBooking({ allBookings, userBookings, spots, onBookingComplete }) {
  const [weeks, setWeeks] = useState([]); // stores weekStart Date objects
  const [days, setDays] = useState([]); // stores weekday offsets: 0=Mon ... 4=Fri
  const [prioritizeUnderground, setPrioritizeUnderground] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("current");

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const today = new Date();

  const monthOffsets = { current: 0, next: 1 };

  const monthDate = useMemo(() => {
    const dt = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffsets[selectedMonth],
      1
    );
    return { year: dt.getFullYear(), month: dt.getMonth() };
  }, [selectedMonth, today]);

  const isInFinalWeekOfMonth = () => {
    const current = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const lastDay = endOfMonth(current);
    const lastMonday = addDays(lastDay, -((lastDay.getDay() + 6) % 7)); // previous Monday
    return isWithinInterval(current, { start: lastMonday, end: lastDay });
  };

  const getWeeksOfMonth = (year, month) => {
    const first = startOfMonth(new Date(year, month, 1));
    const last = endOfMonth(new Date(year, month, 1));

    // Go back to the Monday of the week that includes the 1st
    const day = first.getDay(); // Sun=0, Mon=1, ..., Sat=6
    const daysBackToMonday = (day + 6) % 7; // how many days to subtract
    let weekStart = addDays(first, -daysBackToMonday);

    const result = [];
    while (weekStart <= last) {
      result.push(weekStart);
      weekStart = addWeeks(weekStart, 1);
    }
    return result;
  };

  const validWeeks = useMemo(
    () => getWeeksOfMonth(monthDate.year, monthDate.month),
    [monthDate]
  );

  const isWeekDisabled = (weekStart) => {
    if (selectedMonth === "next") return false;
    // disable week if its Monday is before today and entire week is past
    const weekEnd = addDays(weekStart, 4);
    return isBefore(weekEnd, today);
  };

  const getDateForWeekDay = (weekStart, weekdayOffset) =>
    addDays(weekStart, weekdayOffset);

  const isAlreadyBooked = (date) => {
    const d = format(date, "yyyy-MM-dd");
    return userBookings.some((b) => b.date.startsWith(d));
  };

  const isParkingAvailable = (date) => {
    const d = format(date, "yyyy-MM-dd");
    const bookedCount = allBookings.filter((b) => b.date.startsWith(d)).length;
    return bookedCount < spots.length;
  };

  const isDayDisabled = (weekdayOffset) => {
    // day is disabled if every selected week has invalid date
    return weeks.every((wk) => {
      const date = getDateForWeekDay(wk, weekdayOffset);
      return (
        isBefore(date, today) ||
        isAlreadyBooked(date) ||
        !isParkingAvailable(date)
      );
    });
  };

  const getDayTooltip = (weekdayOffset) => {
    if (!weeks.length) return "";
    const date = getDateForWeekDay(weeks[0], weekdayOffset);
    if (isBefore(date, today)) return "Date is in the past";
    if (isAlreadyBooked(date)) return "Already booked";
    if (!isParkingAvailable(date)) return "No spots left";
    return "";
  };

  const handleToggleWeek = (wk) => {
    if (isWeekDisabled(wk)) return;
    setWeeks((prev) =>
      prev.some((d) => d.getTime() === wk.getTime())
        ? prev.filter((d) => d.getTime() !== wk.getTime())
        : [...prev, wk]
    );
  };

  const handleToggleDay = (off) => {
    if (isDayDisabled(off)) return;
    setDays((prev) =>
      prev.includes(off) ? prev.filter((d) => d !== off) : [...prev, off]
    );
  };

  const getTargetDates = () =>
    weeks.flatMap((wk) => days.map((off) => getDateForWeekDay(wk, off)));

  const handleQuickBooking = async () => {
    if (!weeks.length) return toast.error("Select at least one week");
    if (!days.length) return toast.error("Select at least one day");

    const dates = getTargetDates();
    const uniq = Array.from(
      new Set(dates.map((d) => format(d, "yyyy-MM-dd")))
    ).map((s) => new Date(s));

    const valid = uniq.filter(
      (d) => !isBefore(d, today) && !isAlreadyBooked(d) && isParkingAvailable(d)
    );
    if (!valid.length) return toast.error("No valid dates");
    if (valid.length < uniq.length)
      toast("Some skipped (past/booked/full)", { icon: "⚠️" });

    setIsBooking(true);
    try {
      const res = await quickBook(
        valid.map((d) => format(d, "yyyy-MM-dd")),
        prioritizeUnderground
      );
      onBookingComplete(res);
    } catch (err) {
      toast.error(err.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="px-6 my-10 flex justify-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-slate-50 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 relative min-h-[340px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 opacity-10 rounded-full blur-2xl" />
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">
              🚀 Quick Booking
            </h2>
          </div>

          {/* Month Selector */}
          {selectedMonth === "current" && isInFinalWeekOfMonth() && (
            <div className="mb-4">
              <label>Select Month</label>
              <div className="flex gap-2">
                {["current", "next"].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedMonth(key);
                      setWeeks([]);
                      setDays([]);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selectedMonth === key
                        ? "bg-purple-600 text-white"
                        : "text-gray-700 border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    {format(
                      new Date(
                        today.getFullYear(),
                        today.getMonth() + monthOffsets[key]
                      ),
                      "MMMM"
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Week Selector */}
          <div className="mb-4">
            <label>Select Weeks</label>
            <div className="flex gap-2 flex-wrap">
              {validWeeks.map((wk, i) => {
                const disabled = isWeekDisabled(wk);
                const sel = weeks.some((d) => d.getTime() === wk.getTime());
                return (
                  <button
                    key={i}
                    onClick={() => handleToggleWeek(wk)}
                    disabled={disabled}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      sel
                        ? "bg-purple-500 text-white"
                        : "text-gray-700 border-gray-300 hover:border-purple-400"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    Week {i + 1} ({format(wk, "MMM d")})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Selector */}
          <div className="mb-4">
            <label>Select Days</label>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((wd, idx) => {
                const disabled = isDayDisabled(idx);
                const sel = days.includes(idx);
                return (
                  <button
                    key={wd}
                    onClick={() => handleToggleDay(idx)}
                    disabled={disabled}
                    title={disabled ? getDayTooltip(idx) : ""}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      sel
                        ? "bg-purple-500 text-white"
                        : "text-gray-700 border-gray-300 hover:border-purple-400"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {wd}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Underground Toggle & Submit */}
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              checked={prioritizeUnderground}
              onChange={() => setPrioritizeUnderground((p) => !p)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600"
            />
            <label>Prioritize underground parking</label>
          </div>
          <button
            disabled={isBooking}
            onClick={handleQuickBooking}
            className={`w-full rounded-xl py-3 text-white ${
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
