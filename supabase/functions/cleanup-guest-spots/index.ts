// supabase/functions/cleanup-guest-spots/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

serve(async (_req) => {
  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("spots")
    .delete()
    .lt("available_date", today)
    .eq("type", "guest");

  if (error) {
    return new Response(`Cleanup failed: ${error.message}`, { status: 500 });
  }

  return new Response("Guest spots cleanup completed.", { status: 200 });
});
