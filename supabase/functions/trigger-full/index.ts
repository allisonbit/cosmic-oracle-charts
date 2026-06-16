import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = Deno.env.get("WEBHOOK_API_KEY"); // fail closed; no service_role bearer
  if (!validKey || !apiKey) return false;
  return apiKey === validKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // SECURITY (audit P0): orchestrator that fans out to the content/restructure
  // agents (LLM spend + DB writes). Require the webhook secret before doing anything.
  if (!verifyApiKey(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Forward the (validated) webhook secret downstream
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "") || "";

  try {
    const body = await req.json().catch(() => ({}));

    // Run content agent first
    const contentRes = await fetch(`${supabaseUrl}/functions/v1/trigger-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ count: body.count || 5, category: body.category || "insights" }),
    });
    const contentResult = await contentRes.json();

    // Then run restructure agent
    const restructureRes = await fetch(`${supabaseUrl}/functions/v1/trigger-restructure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({}),
    });
    const restructureResult = await restructureRes.json();

    return new Response(JSON.stringify({
      success: true,
      content: contentResult,
      restructure: restructureResult,
      duration_ms: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
