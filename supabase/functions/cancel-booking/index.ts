import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { user, error: userError } = await getUser(req);
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

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

  // Lookup spot ID by code
  const { data: spot, error: spotError } = await supabase
    .from("spots")
    .select("id")
    .eq("id", spotId)
    .single();

  if (spotError || !spot) {
    return new Response("Invalid spot code: spot does not exist", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Delete booking by user, spot_id, and date
  const { error: deleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("user_id", user.id)
    .eq("spot_id", spot.id)
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
