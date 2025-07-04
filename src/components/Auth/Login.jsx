/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../utils/supabaseClient";

const FUNCTION_URL_BASE = "https://fflgdynxowljjfjytyhd.functions.supabase.co";

export default function Login() {
  const [session, setSession] = useState(null);

  // Check for OAuth error message on load (redirect error)
  useEffect(() => {
    const url = new URL(window.location.href);
    const errorDescription = url.searchParams.get("error_description");

    if (errorDescription) {
      const decodedError = decodeURIComponent(errorDescription);

      if (decodedError.includes("Only @novity.io emails allowed")) {
        toast.error("🚫 Only @novity.io emails are allowed.", {
          autoClose: 5000,
          position: "top-center",
          pauseOnHover: true,
          closeOnClick: true,
        });
      } else {
        toast.error(`Login failed: ${decodedError}`, {
          autoClose: 5000,
          position: "top-center",
          pauseOnHover: true,
          closeOnClick: true,
        });
      }

      // Clean URL to remove error params
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // On mount, check if user session exists (handles redirect login)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        insertUserIfNotExists(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          insertUserIfNotExists(session.user);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Function to call your Supabase Edge Function 'add-user'
  async function insertUserIfNotExists(user) {
    try {
      const token = (await supabase.auth.getSession()).data.session
        .access_token;
      const res = await fetch(`${FUNCTION_URL_BASE}/add-user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error("Failed to sync user data: " + text);
        console.error("Add user error:", text);
      }
    } catch (err) {
      toast.error("Failed to sync user data.");
      console.error("Add user exception:", err);
    }
  }

  // Start OAuth login flow
  const handleLogin = async () => {
    const redirectTo = `${window.location.origin}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      toast.error("Login failed: " + error.message, {
        autoClose: 5000,
        position: "top-center",
        pauseOnHover: true,
        closeOnClick: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-[#04C1F9] via-[#F46429] to-[#69DC8E] items-center justify-center relative">
        <img
          src="/images/LoginCarPark.jpg"
          alt="Parking lot"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-10 bg-black/40 p-8 rounded-lg text-white px-10 backdrop-blur-sm">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-xl">Novipark</h1>
          <p className="text-lg max-w-md drop-shadow-md">
            Reserve your parking spot with ease. Exclusively for{" "}
            <strong>novity.io</strong> users.
          </p>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center bg-white px-8 py-16 overflow-hidden">
        {/* Blurred Gradient Blob */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-gradient-to-tr from-[#04C1F9] via-[#F46429] to-[#69DC8E] opacity-20 rounded-full blur-3xl z-0"></div>

        {/* Login Box */}
        <div className="max-w-md w-full space-y-8 relative z-10 bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-2">
              Only emails on{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                novity.io
              </code>{" "}
              are allowed.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-5 text-gray-700 font-medium shadow hover:shadow-md transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#04C1F9]"
          >
            <FcGoogle className="w-6 h-6" />
            Continue with Google
          </button>

          <div className="mt-8 text-center text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Parking Booking • Powered by
            Supabase
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
