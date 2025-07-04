// supabase/functions/book-spot/index.ts
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

  // Authenticate user
  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  // Parse request body
  let body: { spotCode?: string; date?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  const { spotCode, date } = body;

  if (!spotCode || !date) {
    return new Response("Missing 'spotCode' or 'date'", { status: 400, headers: corsHeaders });
  }

  // Look up spot ID by code (spotCode is string, unique)
  const { data: spot, error: spotError } = await supabase
    .from("spots")
    .select("id")
    .eq("code", spotCode)
    .single();

  if (spotError || !spot) {
    return new Response("Invalid spot code: spot does not exist", { status: 400, headers: corsHeaders });
  }

  const spotIdInt = spot.id;

  // Insert booking with real spot id
  const { data, error: insertError } = await supabase
    .from("bookings")
    .insert([
      {
        spot_id: spotIdInt,
        booking_date: date,
        user_id: user.id,
        user_email: user.email,
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
