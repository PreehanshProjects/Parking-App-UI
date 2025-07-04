// functions/get-bookings-by-user.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  console.log(`Request method: ${req.method}`);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { user, error: userError } = await getUser(req);
  if (userError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  // Optional: only allow admin to fetch bookings of other users
  // if (!user.is_admin) return new Response("Forbidden", { status: 403, headers: corsHeaders });

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return new Response("Missing userId param", { status: 400, headers: corsHeaders });
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      spot_id,
      booking_date,
      spots(type, code),
      user_id
    `)
    .eq("user_id", userId);

  if (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }

  const transformed = bookings.map((b) => ({
    id: b.id,
    spotId: b.spot_id,
    spotCode: b.spots?.code ?? null,
    date: b.booking_date,
    type: b.spots?.type ?? "unknown",
    userId: b.user_id,
  }));

  return new Response(JSON.stringify(transformed), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
