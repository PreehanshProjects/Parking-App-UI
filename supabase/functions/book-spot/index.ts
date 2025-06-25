import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with frontend origin in prod
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Authenticate user
  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Parse and validate request body
  let body: { spotId?: number; date?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { spotId, date } = body;

  if (!spotId || !date) {
    return new Response("Missing 'spotId' or 'date' in request body", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check for duplicate booking by the user on the same date
  const { count: existingCount, error: dupError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("booking_date", date);

  if (dupError) {
    return new Response(`Error checking user bookings: ${dupError.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (existingCount && existingCount > 0) {
    return new Response("You already have a booking on this date.", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check if the spot is already booked on that date
  const { count: spotTakenCount, error: spotError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("spot_id", spotId)
    .eq("booking_date", date);

  if (spotError) {
    return new Response(`Error checking spot availability: ${spotError.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (spotTakenCount && spotTakenCount > 0) {
    return new Response("This spot is already booked for the selected date.", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Insert the new booking
  const { data, error: insertError } = await supabase
    .from("bookings")
    .insert([
      {
        spot_id: spotId,
        booking_date: date,
        user_id: user.id, // ✅ Correct field for Supabase Auth
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    return new Response(`Error creating booking: ${insertError.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
