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
    // Auth check
    if (!verifyApiKey(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const count = body.count || 5;
    const category = body.category || "insights";

    // Log start
    await supabase.from("automation_logs").insert({
      agent_type: "content",
      action: "generate_content",
      details: { count, category, trigger: "webhook" },
      status: "running",
    });

    // Call the AI to generate content
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const topics = [
      "Bitcoin price analysis and market outlook",
      "Ethereum ecosystem developments and DeFi trends",
      "Cryptocurrency regulation updates worldwide",
      "Altcoin opportunities and emerging projects",
      "Blockchain technology innovations and use cases",
      "Crypto market sentiment and whale activity",
      "NFT market trends and digital collectibles",
      "Layer 2 solutions and scalability developments",
      "Stablecoin market dynamics and yields",
      "Crypto security best practices and threat analysis",
    ];

    const selectedTopics = topics.sort(() => Math.random() - 0.5).slice(0, count);
    const drafts: any[] = [];

    for (const topic of selectedTopics) {
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
              content: `You are a professional crypto analyst writing for OracleBull.com. Write a comprehensive, SEO-optimized article. Return JSON only with these fields: title, slug, content (HTML, 800-1500 words), metaTitle (under 60 chars), metaDescription (under 160 chars), keywords (array of 5 strings), category.`,
            },
            {
              role: "user",
              content: `Write an article about: ${topic}. Today's date: ${new Date().toISOString().split("T")[0]}. Make it current, data-driven, and actionable for investors.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_article",
                description: "Create a structured blog article",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    content: { type: "string" },
                    metaTitle: { type: "string" },
                    metaDescription: { type: "string" },
                    keywords: { type: "array", items: { type: "string" } },
                    category: { type: "string" },
                  },
                  required: ["title", "slug", "content", "metaTitle", "metaDescription", "keywords", "category"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_article" } },
        }),
      });

      if (!aiResponse.ok) {
        console.error("AI error:", await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;

      const article = JSON.parse(toolCall.function.arguments);

      const { data: draft } = await supabase.from("content_drafts").insert({
        title: article.title,
        slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content: article.content,
        meta_title: article.metaTitle,
        meta_description: article.metaDescription,
        category: article.category || category,
        status: "draft",
        agent_type: "content",
        ai_model: "gemini-2.5-flash",
        keywords: article.keywords || [],
      }).select().single();

      if (draft) drafts.push(draft);
    }

    const duration = Date.now() - startTime;

    // Log completion
    await supabase.from("automation_logs").insert({
      agent_type: "content",
      action: "generate_content_complete",
      details: { draftsCreated: drafts.length, duration_ms: duration },
      status: "success",
      duration_ms: duration,
    });

    return new Response(JSON.stringify({
      success: true,
      draftsCreated: drafts.length,
      drafts: drafts.map(d => ({ id: d.id, title: d.title, status: d.status })),
      duration_ms: duration,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    await supabase.from("automation_logs").insert({
      agent_type: "content",
      action: "generate_content_error",
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
