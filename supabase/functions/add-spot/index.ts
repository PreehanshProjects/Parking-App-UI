// supabase/functions/add-spot/index.ts
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

  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  let body: { location?: string; type?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  const { location, type, code } = body;

  if (!location || !type || !code) {
    return new Response("Missing 'location', 'type' or 'code'", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data, error } = await supabase
    .from("spots")
    .insert([{ location, type, code }])
    .select()
    .single();

  if (error) {
    return new Response(`Error adding spot: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
