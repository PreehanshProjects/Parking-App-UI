// supabase/functions/add-user/index.ts
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
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // Authenticate user
  const { user, error: authError } = await getUser(req);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  // Check if user already exists in your users table
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (selectError && selectError.code !== "PGRST116") { // PGRST116 = no rows found
    return new Response(`Database error: ${selectError.message}`, { status: 500, headers: corsHeaders });
  }

  if (existingUser) {
    // User already exists, return it
    return new Response(JSON.stringify(existingUser), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Insert new user
  const { data: insertedUser, error: insertError } = await supabase
    .from("users")
    .insert([
      {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return new Response(`Insert error: ${insertError.message}`, { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify(insertedUser), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
