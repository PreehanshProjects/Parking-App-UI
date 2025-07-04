// src/api/spot.js
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
    const clone = response.clone();
    const json = await clone.json();
    return json.message || JSON.stringify(json);
  } catch {
    return await response.text();
  }
}

/**
 * Fetches all spots.
 * @returns {Promise<Array>}
 */
export async function getSpots() {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/get-spots`, {
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
 * Adds a new spot.
 * @param {string} location
 * @param {string} type
 * @param {string} code
 * @returns {Promise<Object>} The created spot
 */
export async function addSpot(location, type, code, available_date = null) {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/add-spot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ location, type, code, available_date }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json();
}

/**
 * Deletes a spot by ID.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteSpot(id) {
  const token = await getToken();

  const response = await fetch(`${FUNCTION_URL_BASE}/delete-spot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
