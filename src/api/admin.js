// src/api/admin.js

import { getToken } from "./booking"; // reuse your existing getToken

const FUNCTION_URL_BASE = "https://fflgdynxowljjfjytyhd.functions.supabase.co";

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
 * Helper to do authorized fetch with common error handling.
 * @param {string} url
 * @param {object} options fetch options
 */
async function authorizedFetch(url, options = {}) {
  const token = await getToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

/**
 * Get all users.
 */
export async function getAllUsers() {
  return authorizedFetch(`${FUNCTION_URL_BASE}/get-all-users`, {
    method: "GET",
  });
}

/**
 * Get bookings for a specific user.
 * @param {string} userId
 */
export async function getBookingsByUser(userId) {
  return authorizedFetch(
    `${FUNCTION_URL_BASE}/get-bookings-by-user?userId=${userId}`,
    { method: "GET" }
  );
}

/**
 * Cancel a booking by spotId and date.
 * @param {string} spotId
 * @param {string} date ISO format date
 */
export async function cancelBooking(spotId, date) {
  return authorizedFetch(`${FUNCTION_URL_BASE}/cancel-booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spotId, date }),
  });
}

/**
 * Add user if not exists.
 */
export async function addUserIfNotExists() {
  return authorizedFetch(`${FUNCTION_URL_BASE}/add-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
