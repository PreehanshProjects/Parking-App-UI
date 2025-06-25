// supabase/functions/get-all-bookings/index.ts
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
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, spot_id, booking_date, user_id, user_email, spots(type)");

  if (error) {
    return new Response(error.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const result = data.map((b) => ({
    id: b.id,
    spotId: b.spot_id,
    date: b.booking_date,
    userId: b.user_id,
    userEmail: b.user_email,
    type: b.spots?.type ?? "unknown",
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
