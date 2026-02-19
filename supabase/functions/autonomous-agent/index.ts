import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const SITE_URL = "https://oraclebull.com";
const SITE_BRAND = "OracleBull";

// All pages to audit each cycle
const SITE_PAGES = [
  { path: "/", name: "Homepage" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/sentiment", name: "Sentiment Analysis" },
  { path: "/explorer", name: "Token Explorer" },
  { path: "/predictions", name: "AI Predictions" },
  { path: "/strength-meter", name: "Strength Meter" },
  { path: "/crypto-factory", name: "Crypto Factory" },
  { path: "/insights", name: "Insights Hub" },
  { path: "/learn", name: "Learn" },
  { path: "/about", name: "About" },
  { path: "/sitemap", name: "Sitemap" },
  { path: "/market/best-crypto-to-buy-today", name: "Best Crypto Market" },
  { path: "/chain/ethereum", name: "Ethereum Chain" },
  { path: "/chain/bitcoin", name: "Bitcoin Chain" },
  { path: "/chain/solana", name: "Solana Chain" },
];

// Trending crypto topics pool — Claude will select the best one
const TOPIC_POOL = [
  "Bitcoin halving impact on altcoins in 2025",
  "Ethereum Layer 2 ecosystem growth and opportunities",
  "AI tokens and crypto AI sector analysis",
  "Solana DeFi ecosystem and yield opportunities",
  "Crypto market dominance shifts and altcoin season signals",
  "Whale wallet tracking and on-chain intelligence",
  "Real World Assets (RWA) tokenization in 2025",
  "Decentralized AI and blockchain convergence",
  "Crypto staking yields comparison across networks",
  "Bitcoin ETF flows and institutional accumulation patterns",
  "DePIN projects and physical infrastructure tokens",
  "Meme coin cycle analysis and risk management",
  "Cross-chain bridges and interoperability trends",
  "On-chain sentiment signals vs price action divergence",
  "Crypto regulatory landscape 2025 global update",
  "NFT utility and gaming token resurgence",
  "Stablecoin market dynamics and USDC vs USDT",
  "ZK-proof technology adoption by major chains",
  "Crypto derivatives market: funding rates and open interest",
  "Portfolio rebalancing strategies for crypto bear/bull cycles",
];

function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = Deno.env.get("WEBHOOK_API_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!validKey || !apiKey) return false;
  return apiKey === validKey;
}

// Step 1: Quick SEO audit of pages
async function auditPage(path: string): Promise<{
  path: string;
  status: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasH1: boolean;
  wordCount: number;
  issues: string[];
}> {
  const issues: string[] = [];
  try {
    const url = `${SITE_URL}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const html = await res.text();
    const hasTitle = /<title[^>]*>[^<]{10,}/i.test(html);
    const hasDescription = /meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/i.test(html);
    const hasH1 = /<h1[^>]*>[^<]{5,}/i.test(html);
    const textContent = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const wordCount = textContent.split(" ").filter(w => w.length > 3).length;

    if (!hasTitle) issues.push("Missing or short title tag");
    if (!hasDescription) issues.push("Missing or short meta description");
    if (!hasH1) issues.push("Missing H1 tag");
    if (wordCount < 600) issues.push(`Thin content (${wordCount} words, target 600+)`);

    return { path, status: res.status, hasTitle, hasDescription, hasH1, wordCount, issues };
  } catch (e) {
    return { path, status: 0, hasTitle: false, hasDescription: false, hasH1: false, wordCount: 0, issues: [`Fetch error: ${e.message}`] };
  }
}

// Step 2: Call Claude to decide strategy + generate content
async function runClaudeAgent(supabase: any, auditResults: any[], existingArticleSlugs: string[]): Promise<{
  action: string;
  article?: any;
  seoOptimizations?: any[];
  reasoning: string;
  topicSelected?: string;
}> {
  const rawKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
  const ANTHROPIC_API_KEY = rawKey.trim().replace(/[^\x20-\x7E]/g, "");
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

  const pagesWithIssues = auditResults.filter(r => r.issues.length > 0);
  const thinPages = auditResults.filter(r => r.wordCount < 600 && r.wordCount > 0);

  const systemPrompt = `You are the OracleBull Autonomous Growth Agent — an expert SEO and content strategist for ${SITE_URL}, a professional crypto AI analytics platform.

Your mission each 6-hour cycle:
1. Analyze the site audit data provided
2. Decide the highest-impact action: generate a new SEO article OR optimize existing page recommendations
3. Always generate exactly 1 new article per cycle (1200-1800 words)
4. The article must target high-intent crypto/AI/blockchain keywords with rising search trends
5. Content must be Google AdSense safe — no spam, no sensational price predictions, professional tone
6. Include internal links to platform features: /predictions, /sentiment, /explorer, /strength-meter, /dashboard, /crypto-factory, /learn, /insights
7. Never duplicate existing slugs

Brand voice: Professional crypto AI analytics platform. Data-driven. Authoritative. Educational.

STRICT RULES:
- No layout changes
- No script modifications  
- No duplicate content (check existing slugs)
- AdSense-safe content only
- One article per cycle maximum
- Always include FAQ section with 3-5 questions
- Always include internal links (minimum 3)
- Proper H1, H2, H3 hierarchy`;

  const userPrompt = `SITE AUDIT RESULTS (${new Date().toISOString()}):

Pages audited: ${auditResults.length}
Pages with issues: ${pagesWithIssues.length}
Thin content pages: ${thinPages.map(p => p.path).join(", ") || "None"}

Issues found:
${pagesWithIssues.map(p => `- ${p.path}: ${p.issues.join(", ")}`).join("\n") || "No critical issues"}

EXISTING ARTICLE SLUGS (do NOT duplicate):
${existingArticleSlugs.slice(0, 30).join(", ")}

AVAILABLE TOPICS (pick the highest opportunity one, or create your own):
${TOPIC_POOL.join("\n")}

TODAY'S DATE: ${new Date().toISOString().split("T")[0]}

TASK: Generate 1 complete SEO article. Return a JSON object with this exact structure:
{
  "action": "generate_article",
  "reasoning": "Why you chose this topic and approach",
  "topicSelected": "The topic chosen",
  "article": {
    "title": "SEO-optimized title (50-60 chars)",
    "slug": "url-friendly-slug-no-duplicates",
    "metaTitle": "Meta title under 60 chars",
    "metaDescription": "Meta description 140-160 chars with CTA",
    "category": "one of: analysis|education|market|defi|technology|trading",
    "primaryKeyword": "main target keyword",
    "secondaryKeywords": ["keyword2", "keyword3", "keyword4", "keyword5"],
    "content": "Full HTML article 1200-1800 words with H1, H2, H3 tags, paragraphs, and internal links to OracleBull pages",
    "takeaways": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3", "Key takeaway 4"],
    "faqs": [
      {"question": "Q1?", "answer": "A1"},
      {"question": "Q2?", "answer": "A2"},
      {"question": "Q3?", "answer": "A3"}
    ],
    "readTime": "X min read",
    "wordCount": 1400
  },
  "seoOptimizations": [
    {"page": "/path", "recommendation": "specific improvement"}
  ]
}

CRITICAL: The content field must be complete HTML with proper heading hierarchy. Include at least 3 links to internal pages like <a href="/predictions">AI Price Predictions</a>, <a href="/sentiment">Market Sentiment</a>, etc. Make it genuinely useful and informative.`;

  const cleanKey = ANTHROPIC_API_KEY.replace(/[^\x21-\x7E]/g, "");
  const reqHeaders = new Headers();
  reqHeaders.append("x-api-key", cleanKey);
  reqHeaders.append("anthropic-version", "2023-06-01");
  reqHeaders.append("content-type", "application/json");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "";

  // Extract JSON from Claude's response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
}

// Step 3: Publish article to blog_articles table
async function publishArticle(supabase: any, article: any): Promise<string> {
  const articleId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

  const { data, error } = await supabase.from("blog_articles").insert({
    article_id: articleId,
    title: article.title,
    slug: slug,
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
    image_url: getCategoryImage(article.category),
    internal_link: [
      { text: "AI Predictions", url: "/predictions" },
      { text: "Market Sentiment", url: "/sentiment" },
      { text: "Token Explorer", url: "/explorer" },
    ],
  }).select().single();

  if (error) throw new Error(`Failed to publish: ${error.message}`);
  return data.id;
}

function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    analysis: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    education: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    market: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&q=80",
    defi: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80",
    technology: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    trading: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80",
  };
  return images[category] || images.analysis;
}

// Main agent loop
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Allow both authenticated and cron requests
  const isCron = req.headers.get("x-cron") === "true";
  if (!isCron && !verifyApiKey(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cycleId = `cycle-${Date.now()}`;
  console.log(`[${cycleId}] 🤖 OracleBull Autonomous Growth Agent starting...`);

  // Log cycle start
  await supabase.from("automation_logs").insert({
    agent_type: "autonomous-agent",
    action: "cycle_start",
    details: { cycleId, timestamp: new Date().toISOString() },
    status: "running",
  });

  try {
    // ── STEP 1: Site Audit ──────────────────────────────────────────
    console.log(`[${cycleId}] STEP 1: Auditing ${SITE_PAGES.length} pages...`);
    const auditResults = await Promise.all(
      SITE_PAGES.slice(0, 8).map(page => auditPage(page.path)) // Audit first 8 for speed
    );

    const totalIssues = auditResults.reduce((sum, r) => sum + r.issues.length, 0);
    console.log(`[${cycleId}] Audit complete. Issues found: ${totalIssues}`);

    // ── STEP 2: Get existing slugs to avoid duplicates ──────────────
    const { data: existingArticles } = await supabase
      .from("blog_articles")
      .select("slug")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingSlugs = (existingArticles || []).map((a: any) => a.slug);

    // ── STEP 3: Run Claude Agent ────────────────────────────────────
    console.log(`[${cycleId}] STEP 2-3: Running Claude Growth Agent...`);
    const agentDecision = await runClaudeAgent(supabase, auditResults, existingSlugs);
    console.log(`[${cycleId}] Claude decision: ${agentDecision.action} — ${agentDecision.topicSelected}`);

    // ── STEP 4: Publish Article ─────────────────────────────────────
    let publishedArticleId: string | null = null;
    if (agentDecision.article) {
      console.log(`[${cycleId}] STEP 4: Publishing article: "${agentDecision.article.title}"`);
      publishedArticleId = await publishArticle(supabase, agentDecision.article);
      console.log(`[${cycleId}] ✅ Article published: ${publishedArticleId}`);
    }

    // ── STEP 5: Log SEO Recommendations ────────────────────────────
    if (agentDecision.seoOptimizations?.length) {
      await supabase.from("automation_logs").insert({
        agent_type: "autonomous-agent",
        action: "seo_recommendations",
        details: {
          cycleId,
          recommendations: agentDecision.seoOptimizations,
          auditSummary: {
            pagesAudited: auditResults.length,
            totalIssues,
            thinPages: auditResults.filter(r => r.wordCount < 600 && r.wordCount > 0).map(r => r.path),
          },
        },
        status: "success",
      });
    }

    const duration = Date.now() - startTime;

    // ── STEP 6: Log cycle completion ────────────────────────────────
    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_complete",
      details: {
        cycleId,
        duration_ms: duration,
        topicSelected: agentDecision.topicSelected,
        reasoning: agentDecision.reasoning,
        articlePublished: !!publishedArticleId,
        articleId: publishedArticleId,
        auditResults: auditResults.map(r => ({ path: r.path, issues: r.issues.length, wordCount: r.wordCount })),
        seoOptimizations: agentDecision.seoOptimizations?.length || 0,
      },
      status: "success",
      duration_ms: duration,
    });

    // ── STEP 7: Performance Metrics ─────────────────────────────────
    await supabase.from("performance_metrics").insert({
      page_path: "/autonomous-agent",
      page_views: 0,
      visitors: 0,
      source: "autonomous-agent",
      recorded_at: new Date().toISOString().split("T")[0],
    });

    console.log(`[${cycleId}] 🎉 Cycle complete in ${duration}ms`);

    return new Response(JSON.stringify({
      success: true,
      cycleId,
      duration_ms: duration,
      articlePublished: !!publishedArticleId,
      articleId: publishedArticleId,
      articleTitle: agentDecision.article?.title,
      topicSelected: agentDecision.topicSelected,
      reasoning: agentDecision.reasoning,
      auditSummary: {
        pagesAudited: auditResults.length,
        totalIssues,
        pagesWithIssues: auditResults.filter(r => r.issues.length > 0).map(r => r.path),
      },
      seoOptimizations: agentDecision.seoOptimizations?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${cycleId}] ❌ Agent error:`, error.message);

    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_error",
      details: { cycleId, error: error.message },
      status: "error",
      error_message: error.message,
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ error: error.message, cycleId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
