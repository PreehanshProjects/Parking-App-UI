import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const { spotId, date } = body;

  if (!spotId || !date) {
    return new Response("Missing spotId or date", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Delete booking
  const { error: deleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("user_id", user.id)
    .eq("spot_id", spotId)
    .eq("booking_date", date);

  if (deleteError) {
    return new Response(`Failed to cancel: ${deleteError.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
