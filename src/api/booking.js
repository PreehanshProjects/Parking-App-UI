// src/api/booking.js
import { supabase } from "../utils/supabaseClient";

const FUNCTION_URL_BASE = "https://fflgdynxowljjfjytyhd.functions.supabase.co";

/**
 * Retrieves the current user's access token from Supabase.
 */
export async function getToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("User not authenticated");
  }

  return session.access_token;
}

/**
 * Parses an error from a fetch response (handles both JSON and text bodies).
 */
async function parseError(response) {
  try {
    const json = await response.json();
    return json.message || JSON.stringify(json);
  } catch {
    return await response.text();
  }
}

/**
 * Books a parking spot for a specific date.
 */
export async function bookSpot(spotId, date) {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/book-spot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spotId, date }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json();
}

/**
 * Gets bookings for current user.
 */
export async function getUserBookings() {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/get-user-bookings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json();
}

/**
 * Cancels a booking.
 */
export async function cancelBooking(spotId, date) {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/cancel-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spotId, date }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json();
}
