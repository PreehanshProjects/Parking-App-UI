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

  const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const weekOrder = ["first","second","third","fourth"];
  const weekOffsets = { first:0, second:7, third:14, fourth:21 };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const isFinalWeek = () => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    return today.getDate() >= lastDay - 6;
  };

  function getDateForWeekday(weekKey, weekdayIndex) {
    let month = selectedMonth==="current" ? currentMonth : currentMonth+1;
    let year = currentYear;
    if (month > 11) { month -= 12; year +=1 }

    const firstOfMonth = new Date(year, month, 1);
    const dayOfWeek1 = firstOfMonth.getDay(); // Sunday=0

    const offsetToMon = dayOfWeek1===1 ? 0 : ((8 - dayOfWeek1)%7);
    const firstMon = new Date(year, month, 1 + offsetToMon);

    const weekIndex = weekOrder.indexOf(weekKey);
    const startOfWeek = new Date(firstMon);
    startOfWeek.setDate(firstMon.getDate() + weekIndex*7);

    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + weekdayIndex);

    return targetDate;
  }

  const isAlreadyBooked = date =>
    userBookings.some(b => new Date(b.date).toLocaleDateString("en-CA") === date.toLocaleDateString("en-CA"));

  const isParkingAvailable = date => {
    const ds = date.toLocaleDateString("en-CA");
    return allBookings.filter(b => new Date(b.date).toLocaleDateString("en-CA")===ds).length < spots.length;
  };

  const isWeekDisabled = weekKey => {
    if (selectedMonth!=="current") return false;
    // disable if all 5 days are before today
    return weekdays.every((_,i) => getDateForWeekday(weekKey,i) < today);
  };

  const isDayDisabled = day => {
    if (!weeks.length) return true;
    const idx = weekdays.indexOf(day);
    // enabled if some selected week has that day >= today, not booked, with space
    return weeks.every(wk => {
      const d = getDateForWeekday(wk, idx);
      return d < today || isAlreadyBooked(d) || !isParkingAvailable(d);
    });
  };

  const getDayTooltip = day => {
    if (!weeks.length) return "";
    const idx = weekdays.indexOf(day);
    return weeks.map(wk => {
      const d = getDateForWeekday(wk, idx);
      if (d < today) return "in the past";
      if (isAlreadyBooked(d)) return "already booked";
      if (!isParkingAvailable(d)) return "no space";
      return "";
    }).find(t=>t) || "";
  };

  const handleToggleWeek = wk => {
    if (isWeekDisabled(wk)) return;
    setWeeks(prev => prev.includes(wk) ? prev.filter(x=>x!==wk) : [...prev,wk]);
  };

  const handleToggleDay = day => {
    if (isDayDisabled(day)) return;
    setDays(prev => prev.includes(day) ? prev.filter(x=>x!==day) : [...prev,day]);
  };

  const getTargetDates = () =>
    weeks.flatMap(wk => weekdays.filter(d=>days.includes(d))
      .map(d=>getDateForWeekday(wk, weekdays.indexOf(d)))
    );

  const handleQuickBooking = async () => {
    if (!weeks.length) return toast.error("Select a week");
    if (!days.length) return toast.error("Select days");
    const targets = getTargetDates();
    const unique = Array.from(new Set(targets.map(d=>d.toLocaleDateString("en-CA"))))
      .map(s=>new Date(s));
    const valid = unique.filter(d=>d>=today && !isAlreadyBooked(d) && isParkingAvailable(d));
    if (!valid.length) return toast.error("No valid dates");
    if (valid.length < unique.length)
      toast("Some dates skipped", {icon:"⚠️"});
    setIsBooking(true);
    try {
      const resp = await quickBook(valid.map(d=>d.toLocaleDateString("en-CA")), prioritizeUnderground);
      onBookingComplete(resp);
    } catch(e){
      toast.error(e.message||"Failed");
    } finally{setIsBooking(false);}
  };

  const labels = { current: new Date(currentYear,currentMonth).toLocaleString("default",{month:"long"}), next: new Date(currentYear,currentMonth+1).toLocaleString("default",{month:"long"}) };

  return (
    <div>... UI (weeks, days, button) ...</div>
  )
}

export default QuickBooking;
