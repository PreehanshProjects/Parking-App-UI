import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from "./utils/supabaseClient";

import {
  bookSpot,
  getUserBookings,
  getAllBookings,
  cancelBooking,
} from "./api/booking";

import Navbar from "./components/NavBar";
import Login from "./components/Auth/Login";
import DateSelector from "./components/DateSelector";
import ParkingList from "./components/ParkingList";
import BookingsPage from "./pages/BookingsPage";
import QuickBooking from "./components/QuickBooking";
import BookingSummaryModal from "./components/BookingSummaryModal";
import { parkingSpots as initialSpots } from "./data/parkingSpots";
import "./index.css";

function MainPage({
  spots,
  selectedDate,
  setSelectedDate,
  handleBooking,
  allBookings,
  userBookings,
  onQuickBookingResults,
}) {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        <div className="flex-1">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
        <div className="flex-1">
          <QuickBooking
            spots={spots}
            allBookings={allBookings}
            userBookings={userBookings}
            onBookingComplete={onQuickBookingResults}
          />
        </div>
      </div>
      <ParkingList spots={spots} onBook={handleBooking} />
    </>
  );
}

function App() {
  const location = useLocation(); // 👈 used to track current route
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userBookings, setUserBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [spots, setSpots] = useState(initialSpots);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingResults, setBookingResults] = useState(null);

  const currentUser = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  const fetchAllBookings = async () => {
    try {
      const bookings = await getAllBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch all bookings:", error);
      toast.error("Could not load spot availability.");
    }
  };

  const fetchUserBookings = async () => {
    try {
      const bookings = await getUserBookings();
      setUserBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch your bookings:", error);
      toast.error("Could not load your bookings.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      // Clean URL hash after OAuth redirect
      if (window.location.hash.startsWith("#access_token")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserBookings();
      fetchAllBookings();
    } else {
      setUserBookings([]);
      setAllBookings([]);
    }
  }, [session]);

  useEffect(() => {
    setSpots(
      initialSpots.map((spot) => {
        const booking = allBookings.find(
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
  }, [allBookings, selectedDate]);

  const handleBooking = async (spotId) => {
    if (!session) return toast.error("Please log in first.");

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) return toast.error("Weekends not allowed.");

    const hasBookingToday = userBookings.some(
      (b) =>
        b.userId === currentUser &&
        new Date(b.date).toDateString() === selectedDate.toDateString()
    );
    if (hasBookingToday)
      return toast.error("Only one booking per day allowed.");

    const spot = spots.find((s) => s.id === spotId);

    if (spot.type === "underground") {
      const weekStart = new Date(selectedDate);
      const dayOffset = selectedDate.getDay();
      weekStart.setDate(weekStart.getDate() - dayOffset);
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
      setIsBooking(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      await bookSpot(spotId, dateStr);
      toast.success("Booking successful!");
      await fetchUserBookings();
      await fetchAllBookings();
    } catch (error) {
      toast.error(error.message || "Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (bookingToCancel) => {
    try {
      setIsCancelling(true);
      await cancelBooking(bookingToCancel.spotId, bookingToCancel.date);
      toast.success("Booking cancelled.");
      await fetchUserBookings();
      await fetchAllBookings();
    } catch (error) {
      toast.error(error.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
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
    <div className="min-h-screen bg-gray-100 relative">
      <Toaster position="bottom-right" />

      {/* ✅ Show Navbar only if NOT on login route */}
      {location.pathname !== "/login" && (
        <Navbar
          isLoggedIn={!!session}
          userEmail={userEmail}
          onLoginToggle={() => (session ? supabase.auth.signOut() : null)}
        />
      )}

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
                allBookings={allBookings}
                userBookings={userBookings}
                onQuickBookingResults={async (rawResults) => {
                  const summary = {
                    success: rawResults.filter((r) => r.status === "booked"),
                    failed: rawResults.filter((r) => r.status !== "booked"),
                  };

                  setBookingResults(summary);
                  await fetchUserBookings();
                  await fetchAllBookings();
                }}
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

      {/* 🚗 Loading animation overlay */}
      {(isBooking || isCancelling) && (
        <div
          className="car-loader fixed inset-0 z-50 flex items-center justify-center"
          style={{
            pointerEvents: "all",
            backgroundColor: "transparent",
          }}
        >
          <img
            src="/car.gif"
            alt="Processing..."
            style={{ maxWidth: "150px" }}
          />
        </div>
      )}

      <BookingSummaryModal
        results={bookingResults}
        onClose={() => setBookingResults(null)}
      />
    </div>
  );
}

export default App;
