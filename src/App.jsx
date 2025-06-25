import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from "./utils/supabaseClient";
import { bookSpot, getUserBookings, cancelBooking } from "./api/booking";

import Navbar from "./components/NavBar";
import Login from "./components/Auth/Login";
import DateSelector from "./components/DateSelector";
import ParkingList from "./components/ParkingList";
import BookingsPage from "./pages/BookingsPage";
import { parkingSpots as initialSpots } from "./data/parkingSpots";
import "./index.css";

function MainPage({ spots, selectedDate, setSelectedDate, handleBooking }) {
  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <ParkingList spots={spots} onBook={handleBooking} />
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState(initialSpots);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentUser = session?.user?.id;
  const userEmail = session?.user?.email ?? null;

  // Fetch user bookings from backend
  const fetchBookings = async () => {
    if (!session) {
      setUserBookings([]);
      return;
    }

    try {
      const bookings = await getUserBookings();
      setUserBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Could not load your bookings.");
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (window.location.hash.startsWith("#access_token")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Listen to auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [session]);

  // Update spots based on bookings for selected date
  useEffect(() => {
    setSpots(
      initialSpots.map((spot) => {
        const booking = userBookings.find(
          (b) =>
            b.spotId === spot.id &&
            new Date(b.date).toDateString() === selectedDate.toDateString()
        );

        return {
          ...spot,
          booked: !!booking,
          bookedBy: booking?.userEmail ?? null,
          type: booking?.type ?? spot.type,
        };
      })
    );
  }, [userBookings, selectedDate]);

  const handleBooking = async (spotId) => {
    if (!session) return toast.error("Please log in first.");

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) return toast.error("Weekends not allowed.");

    const hasBookingToday = userBookings.some(
      (b) =>
        b.userId === currentUser &&
        new Date(b.date).toDateString() === selectedDate.toDateString()
    );
    if (hasBookingToday) return toast.error("One booking per day only.");

    const spot = spots.find((s) => s.id === spotId);

    if (spot.type === "underground") {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - day);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const undergroundBookingsThisWeek = userBookings.filter((b) => {
        const bookingDate = new Date(b.date);
        return (
          b.userId === currentUser &&
          b.type === "underground" &&
          bookingDate >= weekStart &&
          bookingDate <= weekEnd
        );
      });

      if (undergroundBookingsThisWeek.length >= 2) {
        return toast.error("Max 2 underground bookings per week.");
      }
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await bookSpot(spotId, dateStr);
      toast.success("Booking successful!");
      await fetchBookings();
    } catch (error) {
      toast.error(error.message || "Booking failed.");
    }
  };

  const handleCancel = async (bookingToCancel) => {
    try {
      await cancelBooking(bookingToCancel.spotId, bookingToCancel.date);
      toast.success("Booking cancelled.");
      await fetchBookings();
    } catch (error) {
      toast.error(error.message || "Failed to cancel booking.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="bottom-right" />
      <Navbar
        isLoggedIn={!!session}
        userEmail={userEmail}
        onLoginToggle={() => (session ? supabase.auth.signOut() : null)}
      />
      <Routes>
        <Route
          path="/"
          element={
            session ? (
              <MainPage
                spots={spots}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                handleBooking={handleBooking}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/bookings"
          element={
            session ? (
              <BookingsPage bookings={userBookings} onCancel={handleCancel} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="*"
          element={<div className="p-6 text-center">404 – Page not found</div>}
        />
      </Routes>
    </div>
  );
}

export default App;
