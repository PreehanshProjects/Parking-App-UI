// supabaseClient.js (or .ts if you use TypeScript)
import { createClient } from "@supabase/supabase-js";

// Load Supabase URL and anon key from environment variables (Vite format)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Make sure both environment variables are present; otherwise throw an error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or anon key in environment variables. Please check your .env file."
  );
}

// Create a Supabase client instance with session persistence enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist user session in local storage
    detectSessionInUrl: true, // Detect auth session on page load via URL hash (for OAuth redirects)
  },
});
