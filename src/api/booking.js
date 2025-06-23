const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { supabase } from "../utils/supabaseClient";

export async function getToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");
  return session.access_token;
}

async function parseError(response) {
  try {
    const json = await response.json();
    return json.message || JSON.stringify(json);
  } catch {
    return await response.text();
  }
}

export async function bookSpot(spotId, date) {
  const token = await getToken();

  const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spotId, date }),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response);
    throw new Error(errorMessage || "Failed to book spot");
  }

  return await response.json();
}

export async function getUserBookings() {
  const token = await getToken();

  const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(response);
    throw new Error(errorMessage || "Failed to fetch user bookings");
  }

  return await response.json();
}

export async function cancelBooking(spotId, date) {
  const token = await getToken();

  const response = await fetch(`${BACKEND_BASE_URL}/api/bookings/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spotId, date }),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response);
    throw new Error(errorMessage || "Failed to cancel booking");
  }

  return await response.json();
}
