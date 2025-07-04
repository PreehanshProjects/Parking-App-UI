import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [userBookings, setUserBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [spots, setSpots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingResults, setBookingResults] = useState(null);
  const [loadingSpots, setLoadingSpots] = useState(false);

  const currentUser = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  const fetchSpots = useCallback(async () => {
    setLoadingSpots(true);
    try {
      const spotsFromDb = await getSpots();
      setSpots(spotsFromDb);
    } catch {
      // optional toast or silent fail
    } finally {
      setLoadingSpots(false);
    }
  }, []);

  const fetchAllBookings = useCallback(async () => {
    try {
      const bookings = await getAllBookings();
      setAllBookings(bookings);
    } catch {
      // optional toast or silent fail
    }
  }, []);

  const fetchUserBookings = useCallback(async () => {
    try {
      const bookings = await getUserBookings();
      setUserBookings(bookings);
    } catch {
      // optional toast or silent fail
    }
  }, []);

  // Auth session init
  useEffect(() => {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add user and set admin flag
  useEffect(() => {
    if (session) {
      addUserIfNotExists()
        .then((user) => {
          setIsAdmin(!!user?.admin);
        })
        .catch(() => {
          setIsAdmin(false); // Silent fallback
        });
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchSpots();
      fetchUserBookings();
      fetchAllBookings();
    } else {
      setSpots([]);
      setUserBookings([]);
      setAllBookings([]);
    }
  }, [session, fetchSpots, fetchUserBookings, fetchAllBookings]);

  useEffect(() => {
    setSpots((prev) =>
      prev.map((spot) => {
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
    if (!session) return;

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) return;

    const hasBookingToday = userBookings.some(
      (b) =>
        b.userId === currentUser &&
        new Date(b.date).toDateString() === selectedDate.toDateString()
    );
    if (hasBookingToday) return;

    const spot = spots.find((s) => s.id === spotId);
    if (!spot) return;

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

      if (undergroundBookings.length >= 2) return;
    }

    try {
      setIsBooking(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      await bookSpot(spotId, dateStr);
      await fetchUserBookings();
      await fetchAllBookings();
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (bookingToCancel) => {
    try {
      setIsCancelling(true);
      await cancelBooking(bookingToCancel.spotId, bookingToCancel.date);
      await fetchUserBookings();
      await fetchAllBookings();
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
                  // Hide "special" spots unless user is admin
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
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
