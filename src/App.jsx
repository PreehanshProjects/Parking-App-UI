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
    // Get initial session and clear OAuth URL hash if needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (window.location.hash.startsWith("#access_token")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    });

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When session changes, fetch bookings
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Update spots' booked state for selectedDate based on userBookings
  useEffect(() => {
    const bookedIds = userBookings
      .filter(
        (b) => new Date(b.date).toDateString() === selectedDate.toDateString()
      )
      .map((b) => b.spotId);

    setSpots(
      initialSpots.map((spot) => ({
        ...spot,
        booked: bookedIds.includes(spot.id),
      }))
    );
  }, [userBookings, selectedDate]);

  // Handle booking using backend API
  const handleBooking = async (spotId) => {
    if (!session) return toast.error("Please log in first.");

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) return toast.error("Weekends not allowed.");

    // Check if user already booked for selectedDate
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
      // Refresh bookings after successful booking
      await fetchBookings();
    } catch (error) {
      toast.error(error.message || "Booking failed.");
    }
  };

  // Handle cancel booking using backend API
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
