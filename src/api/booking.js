// src/api/booking.js
import { supabase } from "../utils/supabaseClient";

const FUNCTION_URL_BASE = "https://fflgdynxowljjfjytyhd.functions.supabase.co";

/**
 * Retrieves the current user's access token from Supabase.
 * @returns {Promise<string>}
 */
export async function getToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    throw new Error("Failed to retrieve session");
  }

  const session = data?.session;
  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  return session.access_token;
}

/**
 * Parses a fetch error from the response.
 * Clones the response to avoid body-read errors.
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function parseError(response) {
  try {
    const clone = response.clone(); // Clone so we don't exhaust the stream
    const json = await clone.json();
    return json.message || JSON.stringify(json);
  } catch {
    return await response.text();
  }
}

/**
 * Books a parking spot for a specific date.
 * @param {string} spotId
 * @param {string} date - ISO string (YYYY-MM-DD)
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
 * Cancels an existing booking.
 * @param {string} spotId
 * @param {string} date - ISO format
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

/**
 * Gets bookings for the current user.
 * @returns {Promise<Array>}
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
 * Gets all bookings for all users (for admin/global view).
 * @returns {Promise<Array>}
 */
export async function getAllBookings() {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/get-all-bookings`, {
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
 * Automatically books multiple dates according to availability and priority.
 * @param {string[]} dates - Array of date strings (YYYY-MM-DD)
 * @param {boolean} prioritizeUnderground
 * @returns {Promise<Array>} Result for each date
 */
export async function quickBook(dates, prioritizeUnderground = false) {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/quick-book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dates, prioritizeUnderground }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json(); // Expecting array of results: { date, status, [spotId] }
}

