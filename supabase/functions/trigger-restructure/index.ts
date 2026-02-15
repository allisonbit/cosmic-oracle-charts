import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = Deno.env.get("WEBHOOK_API_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!validKey || !apiKey) return false;
  return apiKey === validKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (!verifyApiKey(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("automation_logs").insert({
      agent_type: "restructure",
      action: "analyze_structure",
      details: { trigger: "webhook" },
      status: "running",
    });

    // Gather performance data
    const { data: metrics } = await supabase
      .from("performance_metrics")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(100);

    const { data: articles } = await supabase
      .from("blog_articles")
      .select("slug, title, category, published_at")
      .order("published_at", { ascending: false })
      .limit(50);

    const { data: drafts } = await supabase
      .from("content_drafts")
      .select("id, title, status, category")
      .eq("status", "draft")
      .limit(20);

    // Use AI to analyze and suggest improvements
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a website optimization expert for OracleBull.com, a crypto analytics platform. Analyze the provided data and suggest structural improvements. Return actionable recommendations.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              performanceMetrics: metrics || [],
              recentArticles: articles?.length || 0,
              pendingDrafts: drafts?.length || 0,
              currentPages: [
                "/", "/dashboard", "/prediction-hub", "/sentiment", "/explorer",
                "/strength-meter", "/portfolio", "/insights", "/learn", "/crypto-factory",
              ],
              request: "Analyze site structure and recommend improvements for SEO and user engagement. Consider: internal linking, content distribution, navigation optimization, and page priority.",
            }),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "site_recommendations",
              description: "Return structured site improvement recommendations",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "0-100 site health score" },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        area: { type: "string" },
                        suggestion: { type: "string" },
                        impact: { type: "string" },
                        autoFixable: { type: "boolean" },
                      },
                      required: ["priority", "area", "suggestion", "impact", "autoFixable"],
                    },
                  },
                  contentSuggestions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  navigationChanges: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["overallScore", "recommendations", "contentSuggestions", "navigationChanges"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "site_recommendations" } },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const analysis = toolCall ? JSON.parse(toolCall.function.arguments) : { overallScore: 0, recommendations: [], contentSuggestions: [], navigationChanges: [] };

    // Auto-publish ready drafts if score is good
    let autopublished = 0;
    if (analysis.overallScore >= 70 && drafts && drafts.length > 0) {
      const toPublish = drafts.slice(0, 3);
      for (const draft of toPublish) {
        const { error } = await supabase.from("content_drafts").update({
          status: "published",
          published_at: new Date().toISOString(),
        }).eq("id", draft.id);

        if (!error) {
          // Also insert into blog_articles
          await supabase.from("blog_articles").insert({
            article_id: `auto-${draft.id}`,
            title: draft.title,
            slug: `auto-${Date.now()}-${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`,
            content: draft.title, // Basic content
            category: draft.category || "insights",
            source: "auto-agent",
          });
          autopublished++;
        }
      }
    }

    const duration = Date.now() - startTime;

    await supabase.from("automation_logs").insert({
      agent_type: "restructure",
      action: "analyze_complete",
      details: { analysis, autopublished, duration_ms: duration },
      status: "success",
      duration_ms: duration,
    });

    return new Response(JSON.stringify({
      success: true,
      analysis,
      autopublished,
      duration_ms: duration,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    await supabase.from("automation_logs").insert({
      agent_type: "restructure",
      action: "analyze_error",
      details: { error: error.message },
      status: "error",
      error_message: error.message,
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
