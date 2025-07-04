import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase, getUser } from "../_shared/supabase.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Change for production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const { user, error: userError } = await getUser(req);
  if (userError || !user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Optional admin check here if needed
  // if (!user.is_admin) return new Response("Forbidden", { status: 403, headers: corsHeaders });

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, full_name, avatar_url, created_at");

  if (error) {
    return new Response(error.message, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(users), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
