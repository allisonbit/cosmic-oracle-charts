import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const SITE_URL = "https://oraclebull.com";

const SITE_PAGES = [
  "/", "/dashboard", "/sentiment", "/explorer", "/predictions",
  "/strength-meter", "/crypto-factory", "/insights", "/learn",
  "/about", "/sitemap", "/market/best-crypto-to-buy-today",
  "/chain/ethereum", "/chain/bitcoin", "/chain/solana",
];

// 60+ high-intent keyword-driven topics for organic traffic
const TOPIC_POOL = [
  // Bitcoin price prediction queries (highest search volume)
  "Bitcoin price prediction 2025 — expert analysis and forecast",
  "Will Bitcoin reach $200K? Data-driven analysis",
  "Bitcoin halving 2028 — what history tells us about the next cycle",
  "Is Bitcoin a good investment right now? Comprehensive analysis",
  "Bitcoin vs gold — which is the better store of value in 2025",
  // Ethereum & altcoin queries
  "Ethereum price prediction 2025 — technical and on-chain analysis",
  "Best altcoins to buy in February 2025 — AI-powered picks",
  "Solana vs Ethereum — which blockchain wins in 2025",
  "What is the best crypto to buy today for beginners",
  "Top 10 cryptocurrencies to watch this week",
  // AI + Crypto intersection (trending)
  "How AI is transforming crypto trading in 2025",
  "Best AI crypto tokens — complete guide and analysis",
  "AI trading bots explained — do they actually work",
  "What are AI agents in crypto and why do they matter",
  "Machine learning for crypto price prediction — how it works",
  // Beginner guides ("What is" queries)
  "What is cryptocurrency — a complete beginner guide 2025",
  "What is DeFi and how does decentralized finance work",
  "What is blockchain technology — simple explanation",
  "What is a crypto wallet and how to choose one",
  "What are smart contracts and why are they important",
  "What is staking crypto and how to earn passive income",
  "What is a crypto ETF and should you invest in one",
  // "Will" and "Should" intent queries
  "Will crypto recover in 2025 — market cycle analysis",
  "Should I buy Bitcoin now or wait — timing analysis",
  "Will Ethereum outperform Bitcoin this cycle",
  "Is crypto safe to invest in — risk analysis guide",
  // Market analysis & trends
  "Crypto market analysis today — key levels and trends",
  "Crypto fear and greed index explained — how to use it",
  "On-chain analysis guide — what whale wallets reveal",
  "How to read crypto charts — technical analysis for beginners",
  "Crypto market cycles explained — when to buy and sell",
  // DeFi & yield
  "Best DeFi yield farming strategies 2025",
  "What are Real World Assets (RWA) in crypto",
  "Stablecoin yields comparison — USDC vs USDT vs DAI",
  "Liquid staking explained — how to maximize ETH rewards",
  // Technology deep dives
  "Layer 2 solutions explained — Arbitrum vs Optimism vs Base",
  "What are ZK-rollups and why they matter for crypto",
  "Cross-chain bridges — how they work and which are safest",
  "DePIN explained — decentralized physical infrastructure",
  // Trading education
  "Crypto trading strategies for beginners 2025",
  "How to manage risk in crypto — portfolio allocation guide",
  "Dollar cost averaging crypto — complete strategy guide",
  "Crypto tax guide 2025 — what you need to know",
  // Long-tail evergreen
  "How to research a cryptocurrency before investing",
  "Crypto security best practices — protect your investments",
  "Understanding crypto market cap vs fully diluted valuation",
  "Funding rates explained — how to read crypto derivatives signals",
  "NFT utility beyond art — real use cases in 2025",
  "Meme coins explained — opportunity vs risk analysis",
  "How institutional investors are changing crypto markets",
  "Crypto regulation worldwide — 2025 comprehensive update",
];

function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = Deno.env.get("WEBHOOK_API_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!validKey || !apiKey) return false;
  return apiKey === validKey;
}

// Quick SEO audit
async function auditPage(path: string) {
  const issues: string[] = [];
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${SITE_URL}${path}`, { signal: controller.signal });
    clearTimeout(tid);
    const html = await res.text();
    const hasTitle = /<title[^>]*>[^<]{10,}/i.test(html);
    const hasDesc = /meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/i.test(html);
    const hasH1 = /<h1[^>]*>[^<]{5,}/i.test(html);
    const words = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").split(" ").filter(w => w.length > 3).length;
    if (!hasTitle) issues.push("Missing title");
    if (!hasDesc) issues.push("Missing meta description");
    if (!hasH1) issues.push("Missing H1");
    if (words < 600) issues.push(`Thin content (${words} words)`);
    return { path, status: res.status, hasTitle, hasDesc, hasH1, words, issues };
  } catch (e) {
    return { path, status: 0, hasTitle: false, hasDesc: false, hasH1: false, words: 0, issues: [`Error: ${e.message}`] };
  }
}

// AI Agent using Lovable AI Gateway (Gemini)
async function runGrowthAgent(auditResults: any[], existingSlugs: string[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const pagesWithIssues = auditResults.filter(r => r.issues.length > 0);
  const thinPages = auditResults.filter(r => r.words < 600 && r.words > 0);

  // Select 5 random topics from pool
  const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5);
  const candidateTopics = shuffled.slice(0, 5);

  const systemPrompt = `You are the OracleBull Autonomous Traffic Agent — an expert SEO content strategist for ${SITE_URL}, a free AI-powered crypto analysis platform monetized 100% through Google AdSense.

PRIMARY OBJECTIVE: Maximize organic Google Search traffic safely and sustainably.

CONTENT RULES:
- Write 1200-1800 words of genuinely useful, educational crypto content
- Target high-intent search queries (price predictions, "what is", "how to", "best crypto")
- Use proper H1 > H2 > H3 heading hierarchy in HTML
- Include 3-5 FAQ items targeting People Also Ask queries
- Include minimum 4 internal links to: /predictions, /sentiment, /explorer, /strength-meter, /dashboard, /crypto-factory, /learn, /insights, /market/best-crypto-to-buy-today
- Write for humans first, search engines second
- Professional analyst tone — data-driven, authoritative, educational

STRICT PROHIBITIONS:
- No financial guarantees or profit promises
- No clickbait or misleading claims
- No keyword stuffing
- No plagiarized content
- No medical/illegal/unsafe content
- No layout or script modifications
- Must comply with Google AdSense policies
- Never duplicate an existing slug

TODAY: ${new Date().toISOString().split("T")[0]}

SITE AUDIT:
Pages: ${auditResults.length} audited
Issues: ${pagesWithIssues.map(p => `${p.path}: ${p.issues.join(", ")}`).join("; ") || "None"}
Thin pages: ${thinPages.map(p => p.path).join(", ") || "None"}

EXISTING SLUGS (avoid duplicates): ${existingSlugs.slice(0, 40).join(", ")}

CANDIDATE TOPICS (pick the best one for maximum search traffic, or create your own):
${candidateTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate 1 complete SEO article for maximum organic traffic. Pick the highest-opportunity topic and create a comprehensive, search-optimized article." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "publish_seo_article",
          description: "Publish a complete SEO-optimized article to OracleBull",
          parameters: {
            type: "object",
            properties: {
              reasoning: { type: "string", description: "Why this topic was chosen for maximum traffic" },
              topicSelected: { type: "string", description: "The chosen topic" },
              title: { type: "string", description: "SEO title 50-60 chars with primary keyword" },
              slug: { type: "string", description: "URL-friendly slug, unique, no duplicates" },
              metaTitle: { type: "string", description: "Meta title under 60 chars" },
              metaDescription: { type: "string", description: "Meta description 140-160 chars with CTA" },
              category: { type: "string", enum: ["analysis", "education", "market", "defi", "technology", "trading"] },
              primaryKeyword: { type: "string", description: "Main target keyword for search" },
              secondaryKeywords: { type: "array", items: { type: "string" }, description: "4-5 related keywords" },
              content: { type: "string", description: "Complete HTML article 1200-1800 words with H1, H2, H3 hierarchy, paragraphs, lists, internal links to OracleBull pages. Must be comprehensive and genuinely useful." },
              takeaways: { type: "array", items: { type: "string" }, description: "4-5 key takeaways" },
              faqs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                  },
                  required: ["question", "answer"],
                },
                description: "3-5 FAQ items targeting People Also Ask",
              },
              readTime: { type: "string", description: "Estimated read time e.g. '7 min read'" },
              wordCount: { type: "number", description: "Approximate word count" },
              seoOptimizations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    page: { type: "string" },
                    recommendation: { type: "string" },
                  },
                },
                description: "SEO improvement recommendations for existing pages",
              },
            },
            required: ["reasoning", "topicSelected", "title", "slug", "metaTitle", "metaDescription", "category", "primaryKeyword", "secondaryKeywords", "content", "takeaways", "faqs", "readTime", "wordCount"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "publish_seo_article" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw new Error("Rate limited — will retry next cycle");
    if (response.status === 402) throw new Error("AI credits exhausted — please add credits");
    throw new Error(`AI gateway error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured output");

  return JSON.parse(toolCall.function.arguments);
}

// Publish to blog_articles
async function publishArticle(supabase: any, article: any): Promise<string> {
  const articleId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const images: Record<string, string> = {
    analysis: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    education: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    market: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=80",
    defi: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80",
    technology: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    trading: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80",
  };

  const { data, error } = await supabase.from("blog_articles").insert({
    article_id: articleId,
    title: article.title,
    slug,
    content: article.content,
    meta_title: article.metaTitle,
    meta_description: article.metaDescription,
    category: article.category || "analysis",
    primary_keyword: article.primaryKeyword,
    secondary_keywords: article.secondaryKeywords || [],
    takeaways: article.takeaways || [],
    faqs: article.faqs || [],
    read_time: article.readTime || "7 min read",
    word_count: article.wordCount || 1400,
    source: "autonomous-agent",
    published_at: new Date().toISOString(),
    image_url: images[article.category] || images.analysis,
    internal_link: [
      { text: "AI Price Predictions", url: "/predictions" },
      { text: "Market Sentiment Analysis", url: "/sentiment" },
      { text: "Token Explorer", url: "/explorer" },
      { text: "Crypto Strength Meter", url: "/strength-meter" },
    ],
  }).select().single();

  if (error) throw new Error(`Publish failed: ${error.message}`);
  return data.id;
}

// Main handler
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const isCron = req.headers.get("x-cron") === "true";
  if (!isCron && !verifyApiKey(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cycleId = `cycle-${Date.now()}`;
  console.log(`[${cycleId}] 🤖 OracleBull Autonomous Traffic Agent starting...`);

  await supabase.from("automation_logs").insert({
    agent_type: "autonomous-agent",
    action: "cycle_start",
    details: { cycleId, timestamp: new Date().toISOString(), engine: "lovable-ai-gemini" },
    status: "running",
  });

  try {
    // STEP 1: Audit site
    console.log(`[${cycleId}] STEP 1: Auditing pages...`);
    const auditResults = await Promise.all(SITE_PAGES.slice(0, 10).map(p => auditPage(p)));
    const totalIssues = auditResults.reduce((s, r) => s + r.issues.length, 0);
    console.log(`[${cycleId}] Audit done. ${totalIssues} issues found.`);

    // STEP 2: Get existing slugs
    const { data: existing } = await supabase.from("blog_articles").select("slug").order("created_at", { ascending: false }).limit(100);
    const existingSlugs = (existing || []).map((a: any) => a.slug);

    // STEP 3: Run AI Agent
    console.log(`[${cycleId}] STEP 2-3: Running Gemini Growth Agent...`);
    const result = await runGrowthAgent(auditResults, existingSlugs);
    console.log(`[${cycleId}] AI decision: ${result.topicSelected}`);

    // STEP 4: Check for duplicate slug
    if (existingSlugs.includes(result.slug)) {
      result.slug = `${result.slug}-${Date.now().toString(36)}`;
    }

    // STEP 5: Publish
    console.log(`[${cycleId}] STEP 4: Publishing: "${result.title}"`);
    const articleId = await publishArticle(supabase, result);
    console.log(`[${cycleId}] ✅ Published: ${articleId}`);

    // STEP 6: Log SEO recommendations
    if (result.seoOptimizations?.length) {
      await supabase.from("automation_logs").insert({
        agent_type: "autonomous-agent",
        action: "seo_recommendations",
        details: { cycleId, recommendations: result.seoOptimizations },
        status: "success",
      });
    }

    const duration = Date.now() - startTime;

    // STEP 7: Log completion
    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_complete",
      details: {
        cycleId, duration_ms: duration,
        engine: "lovable-ai-gemini",
        topicSelected: result.topicSelected,
        reasoning: result.reasoning,
        articleId,
        slug: result.slug,
        primaryKeyword: result.primaryKeyword,
        auditSummary: auditResults.map(r => ({ path: r.path, issues: r.issues.length, words: r.words })),
        seoOptimizations: result.seoOptimizations?.length || 0,
      },
      status: "success",
      duration_ms: duration,
    });

    console.log(`[${cycleId}] 🎉 Cycle complete in ${duration}ms`);

    return new Response(JSON.stringify({
      success: true, cycleId, duration_ms: duration,
      engine: "lovable-ai-gemini",
      articlePublished: true, articleId,
      title: result.title, slug: result.slug,
      topicSelected: result.topicSelected,
      reasoning: result.reasoning,
      primaryKeyword: result.primaryKeyword,
      auditSummary: { pagesAudited: auditResults.length, totalIssues },
      seoOptimizations: result.seoOptimizations?.length || 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${cycleId}] ❌ Error:`, error.message);

    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_error",
      details: { cycleId, error: error.message, engine: "lovable-ai-gemini" },
      status: "error",
      error_message: error.message,
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ error: error.message, cycleId }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
