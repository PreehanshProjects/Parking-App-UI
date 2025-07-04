// supabase/functions/delete-spot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Optional: authenticate user before allowing deleteSpot
  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  let body: { id?: number };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  const { id } = body;

  if (!id) {
    return new Response("Missing 'id'", { status: 400, headers: corsHeaders });
  }

  const { error } = await supabase.from("spots").delete().eq("id", id);

  if (error) {
    return new Response(`Error deleting spot: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
