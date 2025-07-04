import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from "./utils/supabaseClient";

import {
  bookSpot,
  getUserBookings,
  getAllBookings,
  cancelBooking,
} from "./api/booking";
import { getSpots } from "./api/spot";
import { addUserIfNotExists } from "./api/admin";

import Navbar from "./components/NavBar";
import Login from "./components/Auth/Login";
import BookingsPage from "./pages/BookingsPage";
import AdminPage from "./pages/AdminPage";
import BookingSummaryModal from "./components/BookingSummaryModal";
import MainPage from "./pages/MainPage";

function App() {
  const location = useLocation();

  // Raw spots fetched from DB (without booking info)
  const [rawSpots, setRawSpots] = useState([]);
  // Spots merged with booking info
  const [spots, setSpots] = useState([]);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [userBookings, setUserBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingResults, setBookingResults] = useState(null);
  const [loadingSpots, setLoadingSpots] = useState(false);

  const currentUser = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  // Fetch raw spots only
  const fetchSpots = useCallback(async () => {
    setLoadingSpots(true);
    try {
      const spotsFromDb = await getSpots();
      setRawSpots(spotsFromDb);
    } catch (error) {
      console.error("Failed to fetch spots:", error);
      toast.error("Failed to load parking spots.");
    } finally {
      setLoadingSpots(false);
    }
  }, []);

  // Fetch all bookings
  const fetchAllBookings = useCallback(async () => {
    try {
      const bookings = await getAllBookings();
      setAllBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch all bookings:", error);
      toast.error("Could not load spot availability.");
    }
  }, []);

  // Fetch current user bookings
  const fetchUserBookings = useCallback(async () => {
    try {
      const bookings = await getUserBookings();
      setUserBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch user bookings:", error);
      toast.error("Could not load your bookings.");
    }
  }, []);

  // Update spots with booking info whenever raw spots, allBookings, or selectedDate changes
  useEffect(() => {
    if (rawSpots.length === 0) {
      setSpots([]); // no spots loaded yet
      return;
    }

    // Map spots with booking status for selected date
    const updatedSpots = rawSpots
      .filter((spot) => {
        if (spot.type !== "guest") return true;

        // If guest spot has a date, show it only on that day
        if (spot.available_date) {
          const available = new Date(spot.available_date).toDateString();
          const selected = selectedDate.toDateString();
          return available === selected;
        }

        // If no available_date (edge case), don't show guest spots
        return false;
      })
      .map((spot) => {
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
      });

    setSpots(updatedSpots);
  }, [rawSpots, allBookings, selectedDate]);

  // Handle initial auth session and subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      // Clear hash after OAuth redirect
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

  // Add user if not exists and get admin flag
  useEffect(() => {
    if (session) {
      addUserIfNotExists()
        .then((user) => setIsAdmin(!!user?.admin))
        .catch((err) => {
          console.error("User sync failed:", err);
          toast.error("Failed to sync user data.");
          setIsAdmin(false);
        });
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  // Fetch spots and bookings when session changes (login/logout)
  useEffect(() => {
    if (session) {
      // Fetch all in parallel, but only update merged spots after both loaded
      Promise.all([
        fetchSpots(),
        fetchUserBookings(),
        fetchAllBookings(),
      ]).catch((err) => {
        console.error("Error loading initial data:", err);
        toast.error("Failed to load initial data.");
      });
    } else {
      // Reset all data on logout
      setRawSpots([]);
      setUserBookings([]);
      setAllBookings([]);
    }
  }, [session, fetchSpots, fetchUserBookings, fetchAllBookings]);

  // Booking handler with proper validation + toasts
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
    if (!spot) return toast.error("Spot not found.");

    if (spot.type === "underground") {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const undergroundBookings = userBookings.filter((b) => {
        const d = new Date(b.date);
        return (
          b.userId === currentUser &&
          b.type === "underground" &&
          d >= weekStart &&
          d <= weekEnd
        );
      });

      if (undergroundBookings.length >= 2)
        return toast.error("Max 2 underground bookings per week.");
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

  // Cancel booking handler
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

      {location.pathname !== "/login" && (
        <Navbar
          isLoggedIn={!!session}
          userEmail={userEmail}
          isAdmin={isAdmin}
          onLoginToggle={() => (session ? supabase.auth.signOut() : null)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            session ? (
              <MainPage
                spots={spots.filter((spot) => {
                  return spot.type !== "special" || isAdmin;
                })}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                handleBooking={handleBooking}
                allBookings={allBookings}
                userBookings={userBookings}
                onQuickBookingResults={async (results) => {
                  const summary = {
                    success: results.filter((r) => r.status === "booked"),
                    failed: results.filter((r) => r.status !== "booked"),
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
          path="/admin"
          element={
            session && isAdmin ? (
              <AdminPage
                spots={spots}
                fetchSpots={fetchSpots}
                loading={loadingSpots}
              />
            ) : (
              <Navigate to="/" replace />
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

      {(isBooking || isCancelling) && (
        <div className="car-loader fixed inset-0 z-50 flex items-center justify-center bg-transparent">
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
