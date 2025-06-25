// supabase/functions/get-available-spots/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change to specific origin in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return new Response("Missing 'date' query parameter", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Get booked spot IDs for the given date
  const { data: booked, error: bookedError } = await supabase
    .from("bookings")
    .select("spot_id")
    .eq("booking_date", date);

  if (bookedError) {
    return new Response(bookedError.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const bookedIds = booked.map((b) => b.spot_id);

  // Get available spots (not in bookedIds)
  const { data: available, error: availableError } = await supabase
    .from("spots")
    .select("*")
    .not("id", "in", `(${bookedIds.length > 0 ? bookedIds.join(",") : 0})`);

  if (availableError) {
    return new Response(availableError.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(available), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
