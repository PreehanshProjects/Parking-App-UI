import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Auth
  const { user, error: userError } = await getUser(req);
  if (userError || !user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Fetch bookings + spot type + code
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      spot_id,
      booking_date,
      spots(type, code)
    `)
    .eq("user_id", user.id);

  if (bookingsError) {
    return new Response(bookingsError.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Transform response to include spotCode along with other fields
  const transformed = bookings.map((b) => ({
    id: b.id,
    spotId: b.spot_id,
    spotCode: b.spots?.code ?? null,
    date: b.booking_date,
    type: b.spots?.type ?? "unknown",
    userId: user.id,
    userEmail: user.email,
  }));

  return new Response(JSON.stringify(transformed), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
