// supabase/functions/quick-book/index.ts
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

  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  let body: {
    dates?: string[];
    prioritizeUnderground?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  const { dates, prioritizeUnderground = false } = body;

  if (!Array.isArray(dates) || dates.length === 0) {
    return new Response("Missing or invalid 'dates' array", { status: 400, headers: corsHeaders });
  }

  const { data: allBookings, error: fetchError } = await supabase
    .from("bookings")
    .select("spot_id, booking_date");

  if (fetchError) {
    return new Response(`Error fetching bookings: ${fetchError.message}`, { status: 500, headers: corsHeaders });
  }

  const { data: spots, error: spotError } = await supabase
    .from("spots")
    .select("id, type");

  if (spotError) {
    return new Response(`Error fetching spots: ${spotError.message}`, { status: 500, headers: corsHeaders });
  }

  let undergroundCount = 0;
  const results: any[] = [];
  const inserts = [];

  for (const isoDate of dates) {
    const alreadyBooked = allBookings.some(
      (b) =>
        b.booking_date === isoDate &&
        b.user_id === user.id // Ensure it's by this user
    );

    if (alreadyBooked) {
      results.push({ date: isoDate, status: "already booked" });
      continue;
    }

    const bookingsForDate = allBookings.filter((b) => b.booking_date === isoDate);
    const availableSpots = spots.filter(
      (spot) => !bookingsForDate.some((b) => b.spot_id === spot.id)
    );

    const sortedSpots = prioritizeUnderground
      ? [...availableSpots].sort((a, b) => (a.type === "underground" ? -1 : 1))
      : availableSpots;

    let booked = false;
    for (const spot of sortedSpots) {
      if (spot.type === "underground" && undergroundCount >= 2) continue;

      inserts.push({
        spot_id: spot.id,
        booking_date: isoDate,
        user_id: user.id,
        user_email: user.email,
        created_at: new Date().toISOString(),
      });

      if (spot.type === "underground") undergroundCount++;
      results.push({ date: isoDate, spotId: spot.id, status: "booked" });
      booked = true;
      break;
    }

    if (!booked) {
      results.push({ date: isoDate, status: "no availability" });
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("bookings").insert(inserts);
    if (insertError) {
      return new Response(`Error inserting bookings: ${insertError.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
