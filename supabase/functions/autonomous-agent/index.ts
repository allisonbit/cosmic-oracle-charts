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
  "/chain/cardano", "/chain/polygon", "/chain/avalanche",
  "/portfolio", "/contact", "/risk-disclaimer",
];

// 100+ high-intent keyword topics organized by cluster
const TOPIC_CLUSTERS: Record<string, string[]> = {
  "bitcoin-predictions": [
    "Bitcoin price prediction 2025 — expert analysis and forecast",
    "Will Bitcoin reach $200K? Data-driven analysis",
    "Bitcoin halving 2028 — what history tells us about the next cycle",
    "Is Bitcoin a good investment right now? Comprehensive analysis",
    "Bitcoin vs gold — which is the better store of value in 2025",
    "Bitcoin dominance explained — what it means for altcoin season",
    "Bitcoin ETF flows analysis — institutional adoption tracker",
    "Bitcoin mining profitability 2025 — complete cost analysis",
    "Bitcoin whale accumulation patterns — what on-chain data reveals",
    "Bitcoin support and resistance levels — technical analysis today",
  ],
  "ethereum-altcoins": [
    "Ethereum price prediction 2025 — technical and on-chain analysis",
    "Best altcoins to buy in 2025 — AI-powered picks",
    "Solana vs Ethereum — which blockchain wins in 2025",
    "What is the best crypto to buy today for beginners",
    "Top 10 cryptocurrencies to watch this week",
    "Cardano price prediction — ADA forecast and analysis",
    "XRP price prediction 2025 — Ripple court case impact",
    "Avalanche AVAX analysis — ecosystem growth and price outlook",
    "Polygon MATIC to POL migration — complete guide",
    "Best layer 1 blockchains compared — 2025 performance ranking",
  ],
  "ai-crypto": [
    "How AI is transforming crypto trading in 2025",
    "Best AI crypto tokens — complete guide and analysis",
    "AI trading bots explained — do they actually work",
    "What are AI agents in crypto and why do they matter",
    "Machine learning for crypto price prediction — how it works",
    "Top AI and machine learning crypto projects 2025",
    "AI-powered portfolio management for crypto investors",
    "How ChatGPT and AI tools help crypto research",
    "Decentralized AI networks — the next big crypto narrative",
    "AI sentiment analysis for crypto — how algorithms read the market",
  ],
  "beginner-guides": [
    "What is cryptocurrency — a complete beginner guide 2025",
    "What is DeFi and how does decentralized finance work",
    "What is blockchain technology — simple explanation",
    "What is a crypto wallet and how to choose one",
    "What are smart contracts and why are they important",
    "What is staking crypto and how to earn passive income",
    "What is a crypto ETF and should you invest in one",
    "How to buy cryptocurrency for the first time — step by step",
    "Crypto glossary — 100 terms every investor should know",
    "What is market cap in crypto and why does it matter",
  ],
  "market-analysis": [
    "Crypto market analysis today — key levels and trends",
    "Crypto fear and greed index explained — how to use it",
    "On-chain analysis guide — what whale wallets reveal",
    "How to read crypto charts — technical analysis for beginners",
    "Crypto market cycles explained — when to buy and sell",
    "Bull vs bear market — how to identify and profit from each",
    "Crypto volume analysis — what trading volume really tells you",
    "RSI and MACD for crypto — technical indicator guide",
    "Order book analysis — how to read crypto order flow",
    "Funding rates explained — how to read crypto derivatives signals",
  ],
  "defi-yield": [
    "Best DeFi yield farming strategies 2025",
    "What are Real World Assets RWA in crypto",
    "Stablecoin yields comparison — USDC vs USDT vs DAI",
    "Liquid staking explained — how to maximize ETH rewards",
    "DeFi lending platforms compared — Aave vs Compound 2025",
    "Yield aggregators explained — auto-compounding strategies",
    "Impermanent loss explained — DeFi liquidity provider risks",
    "DeFi insurance — how to protect your crypto investments",
    "Restaking explained — EigenLayer and the restaking revolution",
    "Stablecoin safety guide — which stablecoins are truly safe",
  ],
  "technology": [
    "Layer 2 solutions explained — Arbitrum vs Optimism vs Base",
    "What are ZK-rollups and why they matter for crypto",
    "Cross-chain bridges — how they work and which are safest",
    "DePIN explained — decentralized physical infrastructure",
    "Account abstraction — how ERC-4337 changes crypto wallets",
    "Data availability layers — what Celestia and EigenDA solve",
    "Interoperability protocols — connecting blockchains together",
    "Modular blockchains explained — the future of scalability",
    "MEV explained — how miners extract value from transactions",
    "Blockchain consensus mechanisms — PoW vs PoS vs DPoS compared",
  ],
  "trading-strategy": [
    "Crypto trading strategies for beginners 2025",
    "How to manage risk in crypto — portfolio allocation guide",
    "Dollar cost averaging crypto — complete strategy guide",
    "Crypto tax guide 2025 — what you need to know",
    "How to spot a crypto pump and dump scheme",
    "Crypto portfolio diversification — optimal allocation strategy",
    "Swing trading crypto — beginner to advanced guide",
    "Stop loss strategies for crypto — protect your portfolio",
    "Crypto arbitrage opportunities — how to find and execute",
    "How to create a crypto investment plan — complete framework",
  ],
  "trending-narratives": [
    "Meme coins explained — opportunity vs risk analysis",
    "How institutional investors are changing crypto markets",
    "Crypto regulation worldwide — 2025 comprehensive update",
    "NFT utility beyond art — real use cases in 2025",
    "GameFi and play-to-earn — is it still worth it in 2025",
    "SocialFi explained — decentralized social media platforms",
    "Tokenization of real assets — the trillion dollar opportunity",
    "CBDC vs crypto — central bank digital currencies explained",
    "Crypto and macroeconomics — how interest rates affect Bitcoin",
    "Web3 identity solutions — decentralized identity explained",
  ],
};

// Flatten for backward compat
const ALL_TOPICS = Object.values(TOPIC_CLUSTERS).flat();

function verifyApiKey(req: Request): boolean {
  // Accept any of: x-api-key, Authorization Bearer, apikey header
  const candidates = [
    req.headers.get("x-api-key"),
    req.headers.get("authorization")?.replace("Bearer ", ""),
    req.headers.get("apikey"),
  ].filter(Boolean);

  const validKeys = [
    Deno.env.get("WEBHOOK_API_KEY"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  ].filter(Boolean);

  return candidates.some(c => validKeys.includes(c!));
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
    const words = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").split(" ").filter((w: string) => w.length > 3).length;
    if (!hasTitle) issues.push("Missing title");
    if (!hasDesc) issues.push("Missing meta description");
    if (!hasH1) issues.push("Missing H1");
    if (words < 600) issues.push(`Thin content (${words} words)`);
    return { path, status: res.status, hasTitle, hasDesc, hasH1, words, issues };
  } catch (e) {
    return { path, status: 0, hasTitle: false, hasDesc: false, hasH1: false, words: 0, issues: [`Error: ${e.message}`] };
  }
}

// Determine cycle type based on timing
function getCycleType(): "content" | "optimize" | "expand" {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun
  const hour = now.getUTCHours();
  const dayOfMonth = now.getUTCDate();

  // Monthly strategy expansion: 1st of month, first cycle
  if (dayOfMonth === 1 && hour < 6) return "expand";
  // Weekly optimization: Sunday first cycle
  if (dayOfWeek === 0 && hour < 6) return "optimize";
  // All other cycles: new content
  return "content";
}

// CONTENT CYCLE: Generate 1-2 new SEO articles
async function runContentCycle(supabase: any, auditResults: any[], existingSlugs: string[], cycleId: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const pagesWithIssues = auditResults.filter((r: any) => r.issues.length > 0);

  // Pick topics from underrepresented clusters
  const { data: recentArticles } = await supabase
    .from("blog_articles")
    .select("primary_keyword, category, slug")
    .order("created_at", { ascending: false })
    .limit(50);

  const recentKeywords = (recentArticles || []).map((a: any) => (a.primary_keyword || "").toLowerCase());

  // Find least-covered cluster
  const clusterCounts: Record<string, number> = {};
  for (const [cluster, topics] of Object.entries(TOPIC_CLUSTERS)) {
    clusterCounts[cluster] = recentKeywords.filter((kw: string) =>
      topics.some(t => t.toLowerCase().includes(kw) || kw.includes(cluster))
    ).length;
  }
  const sortedClusters = Object.entries(clusterCounts).sort((a, b) => a[1] - b[1]);
  const targetCluster = sortedClusters[0][0];
  const clusterTopics = TOPIC_CLUSTERS[targetCluster];

  // Pick 5 unused topics from target cluster + 3 from random clusters
  const unusedClusterTopics = clusterTopics.filter(t =>
    !recentKeywords.some((kw: string) => t.toLowerCase().includes(kw))
  );
  const randomTopics = ALL_TOPICS.sort(() => Math.random() - 0.5).slice(0, 3);
  const candidateTopics = [...unusedClusterTopics.slice(0, 5), ...randomTopics];

  const systemPrompt = `You are the OracleBull Autonomous Traffic Agent — an expert SEO content strategist for ${SITE_URL}, a free AI-powered crypto analysis platform monetized 100% through Google AdSense.

PRIMARY OBJECTIVE: Maximize organic Google Search traffic safely and sustainably.
TODAY: ${new Date().toISOString().split("T")[0]}
TARGET CLUSTER: ${targetCluster} (least covered — prioritize this for cluster authority)

CONTENT RULES:
- Write 1200-1800 words of genuinely useful, educational crypto content
- Target high-intent search queries
- Use proper H1 > H2 > H3 heading hierarchy in HTML
- Include 3-5 FAQ items targeting People Also Ask queries
- Include minimum 4 internal links to OracleBull pages: /predictions, /sentiment, /explorer, /strength-meter, /dashboard, /crypto-factory, /learn, /insights
- Professional analyst tone — data-driven, authoritative, educational
- Add a "Key Takeaways" section at the top (bullet points)
- Include relevant statistics and data points (cite year)
- End with a clear conclusion and call-to-action to explore OracleBull tools

STRICT PROHIBITIONS:
- No financial guarantees or profit promises
- No clickbait or misleading claims
- No keyword stuffing
- No plagiarized content
- Must comply with Google AdSense policies
- Never duplicate slug: ${existingSlugs.slice(0, 50).join(", ")}

SITE AUDIT (fix issues where relevant):
${pagesWithIssues.map((p: any) => `${p.path}: ${p.issues.join(", ")}`).join("; ") || "No issues"}

CANDIDATE TOPICS (pick best 2 for maximum combined traffic):
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
        { role: "user", content: "Generate 2 complete SEO articles. Pick 2 high-opportunity topics from different angles for maximum combined organic reach." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "publish_seo_articles",
          description: "Publish 1-2 SEO-optimized articles to OracleBull",
          parameters: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    reasoning: { type: "string" },
                    title: { type: "string", description: "SEO title 50-60 chars" },
                    slug: { type: "string", description: "Unique URL slug" },
                    metaTitle: { type: "string", description: "Under 60 chars" },
                    metaDescription: { type: "string", description: "140-160 chars with CTA" },
                    category: { type: "string", enum: ["analysis", "education", "market", "defi", "technology", "trading"] },
                    primaryKeyword: { type: "string" },
                    secondaryKeywords: { type: "array", items: { type: "string" } },
                    content: { type: "string", description: "Complete HTML article 1200-1800 words" },
                    takeaways: { type: "array", items: { type: "string" } },
                    faqs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { question: { type: "string" }, answer: { type: "string" } },
                        required: ["question", "answer"],
                      },
                    },
                    readTime: { type: "string" },
                    wordCount: { type: "number" },
                  },
                  required: ["reasoning", "title", "slug", "metaTitle", "metaDescription", "category", "primaryKeyword", "content", "takeaways", "faqs", "readTime", "wordCount"],
                },
              },
              clusterExpansionNotes: { type: "string", description: "Notes on which clusters need more content" },
            },
            required: ["articles"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "publish_seo_articles" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw new Error("Rate limited — will retry next cycle");
    if (response.status === 402) throw new Error("AI credits exhausted");
    throw new Error(`AI gateway error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured output");

  const result = JSON.parse(toolCall.function.arguments);
  const articles = result.articles || [result]; // backward compat

  const published: any[] = [];
  for (const article of articles) {
    // Deduplicate slug
    let slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (existingSlugs.includes(slug)) slug = `${slug}-${Date.now().toString(36)}`;
    article.slug = slug;
    existingSlugs.push(slug);

    const id = await publishArticle(supabase, article);
    published.push({ id, title: article.title, slug, primaryKeyword: article.primaryKeyword });
    console.log(`[${cycleId}] ✅ Published: "${article.title}" (${slug})`);
  }

  return { type: "content", targetCluster, articlesPublished: published, clusterNotes: result.clusterExpansionNotes };
}

// OPTIMIZE CYCLE: Improve 3 weakest existing articles
async function runOptimizeCycle(supabase: any, cycleId: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  // Find articles with lowest word count or oldest without updates
  const { data: weakArticles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, content, word_count, meta_title, meta_description, faqs, takeaways, primary_keyword, created_at")
    .order("word_count", { ascending: true, nullsFirst: true })
    .limit(5);

  if (!weakArticles?.length) return { type: "optimize", message: "No articles to optimize" };

  const articlesToOptimize = weakArticles.slice(0, 3);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          content: `You are the OracleBull Weekly Optimization Agent. Your job is to improve existing articles for better search rankings.
TODAY: ${new Date().toISOString().split("T")[0]}

For each article provided, generate improvements:
- Better SEO title (50-60 chars with primary keyword)
- Updated meta description (140-160 chars)
- 2-3 new sections to add (as HTML) to expand the article by 300-500 words
- 2-3 new FAQ items targeting People Also Ask
- Updated key takeaways

RULES:
- Keep existing content structure intact
- Add current 2025 data and statistics
- Improve internal linking to OracleBull tools
- No financial guarantees
- AdSense compliant`,
        },
        {
          role: "user",
          content: `Optimize these ${articlesToOptimize.length} articles:\n${articlesToOptimize.map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.word_count || 0} words, keyword: ${a.primary_keyword || "none"})\nCurrent content preview: ${(a.content || "").slice(0, 300)}...`).join("\n\n")}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "optimize_articles",
          description: "Return optimizations for existing articles",
          parameters: {
            type: "object",
            properties: {
              optimizations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    articleId: { type: "string" },
                    newTitle: { type: "string" },
                    newMetaTitle: { type: "string" },
                    newMetaDescription: { type: "string" },
                    additionalContent: { type: "string", description: "HTML content to append" },
                    newFaqs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { question: { type: "string" }, answer: { type: "string" } },
                        required: ["question", "answer"],
                      },
                    },
                    newTakeaways: { type: "array", items: { type: "string" } },
                    estimatedWordIncrease: { type: "number" },
                  },
                  required: ["articleId", "newTitle", "newMetaTitle", "newMetaDescription", "additionalContent"],
                },
              },
            },
            required: ["optimizations"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "optimize_articles" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Optimize AI error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI returned no optimizations");

  const result = JSON.parse(toolCall.function.arguments);
  const updated: string[] = [];

  for (let i = 0; i < (result.optimizations || []).length; i++) {
    const opt = result.optimizations[i];
    const original = articlesToOptimize[i];
    if (!original) continue;

    const existingFaqs = Array.isArray(original.faqs) ? original.faqs : [];
    const existingTakeaways = Array.isArray(original.takeaways) ? original.takeaways : [];

    const { error } = await supabase.from("blog_articles").update({
      title: opt.newTitle || original.title,
      meta_title: opt.newMetaTitle || original.meta_title,
      meta_description: opt.newMetaDescription || original.meta_description,
      content: (original.content || "") + "\n\n" + (opt.additionalContent || ""),
      faqs: [...existingFaqs, ...(opt.newFaqs || [])],
      takeaways: [...existingTakeaways, ...(opt.newTakeaways || [])],
      word_count: (original.word_count || 0) + (opt.estimatedWordIncrease || 300),
    }).eq("id", original.id);

    if (!error) {
      updated.push(original.slug);
      console.log(`[${cycleId}] 🔧 Optimized: "${opt.newTitle || original.title}"`);
    }
  }

  return { type: "optimize", articlesOptimized: updated.length, slugs: updated };
}

// EXPAND CYCLE: Analyze top cluster and create 3 supporting articles
async function runExpandCycle(supabase: any, existingSlugs: string[], cycleId: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  // Count articles per category to find the strongest cluster
  const { data: allArticles } = await supabase
    .from("blog_articles")
    .select("category, primary_keyword")
    .limit(500);

  const categoryCounts: Record<string, number> = {};
  for (const a of (allArticles || [])) {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "analysis";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          content: `You are the OracleBull Monthly Strategy Agent. Your job is to create supporting long-tail articles that strengthen the top-performing topic cluster.
TODAY: ${new Date().toISOString().split("T")[0]}
TOP CATEGORY: ${topCategory} (${categoryCounts[topCategory]} articles — expand this aggressively)
ALL CATEGORIES: ${JSON.stringify(categoryCounts)}
EXISTING SLUGS: ${existingSlugs.slice(0, 60).join(", ")}

Create 3 highly specific long-tail articles that support and interlink with existing ${topCategory} content.
Each article should target a very specific search query that a larger pillar article wouldn't cover.
These should be 1000-1500 words, highly focused, and link back to the main cluster articles.`,
        },
        { role: "user", content: "Generate 3 long-tail supporting articles for the top cluster." },
      ],
      tools: [{
        type: "function",
        function: {
          name: "publish_cluster_articles",
          description: "Publish supporting long-tail articles",
          parameters: {
            type: "object",
            properties: {
              clusterStrategy: { type: "string", description: "Strategy explanation" },
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    slug: { type: "string" },
                    metaTitle: { type: "string" },
                    metaDescription: { type: "string" },
                    category: { type: "string" },
                    primaryKeyword: { type: "string" },
                    secondaryKeywords: { type: "array", items: { type: "string" } },
                    content: { type: "string" },
                    takeaways: { type: "array", items: { type: "string" } },
                    faqs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { question: { type: "string" }, answer: { type: "string" } },
                        required: ["question", "answer"],
                      },
                    },
                    readTime: { type: "string" },
                    wordCount: { type: "number" },
                  },
                  required: ["title", "slug", "metaTitle", "metaDescription", "category", "primaryKeyword", "content", "faqs", "wordCount"],
                },
              },
            },
            required: ["clusterStrategy", "articles"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "publish_cluster_articles" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Expand AI error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI returned no expansion articles");

  const result = JSON.parse(toolCall.function.arguments);
  const published: any[] = [];

  for (const article of (result.articles || [])) {
    let slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (existingSlugs.includes(slug)) slug = `${slug}-${Date.now().toString(36)}`;
    article.slug = slug;
    existingSlugs.push(slug);

    const id = await publishArticle(supabase, article);
    published.push({ id, title: article.title, slug });
    console.log(`[${cycleId}] 🚀 Cluster expansion: "${article.title}"`);
  }

  return { type: "expand", topCategory, strategy: result.clusterStrategy, articlesPublished: published };
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

  // Auth handled by verify_jwt=false in config.toml + cron/webhook access
  // Additional layer: log caller info for audit
  console.log("Request from:", req.headers.get("x-forwarded-for") || "internal");

  // Allow forcing a specific cycle type via body
  let forcedType: string | null = null;
  try {
    const body = await req.clone().json();
    forcedType = body?.cycleType || null;
  } catch { /* no body */ }

  const cycleType = (forcedType as any) || getCycleType();
  const cycleId = `${cycleType}-${Date.now()}`;
  console.log(`[${cycleId}] 🤖 Autonomous Agent starting — ${cycleType.toUpperCase()} cycle`);

  await supabase.from("automation_logs").insert({
    agent_type: "autonomous-agent",
    action: "cycle_start",
    details: { cycleId, cycleType, timestamp: new Date().toISOString(), engine: "lovable-ai-gemini" },
    status: "running",
  });

  try {
    // Always audit
    console.log(`[${cycleId}] Auditing pages...`);
    const auditResults = await Promise.all(SITE_PAGES.map(p => auditPage(p)));
    const totalIssues = auditResults.reduce((s, r) => s + r.issues.length, 0);
    console.log(`[${cycleId}] Audit: ${totalIssues} issues across ${auditResults.length} pages`);

    // Get existing slugs
    const { data: existing } = await supabase.from("blog_articles").select("slug").order("created_at", { ascending: false }).limit(200);
    const existingSlugs = (existing || []).map((a: any) => a.slug);

    let result: any;

    switch (cycleType) {
      case "optimize":
        result = await runOptimizeCycle(supabase, cycleId);
        break;
      case "expand":
        result = await runExpandCycle(supabase, existingSlugs, cycleId);
        break;
      default:
        result = await runContentCycle(supabase, auditResults, existingSlugs, cycleId);
    }

    const duration = Date.now() - startTime;

    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_complete",
      details: {
        cycleId, cycleType, duration_ms: duration,
        engine: "lovable-ai-gemini",
        result,
        auditSummary: { pagesAudited: auditResults.length, totalIssues },
      },
      status: "success",
      duration_ms: duration,
    });

    console.log(`[${cycleId}] 🎉 ${cycleType.toUpperCase()} cycle complete in ${duration}ms`);

    return new Response(JSON.stringify({
      success: true, cycleId, cycleType, duration_ms: duration,
      engine: "lovable-ai-gemini", result,
      auditSummary: { pagesAudited: auditResults.length, totalIssues },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${cycleId}] ❌ Error:`, error.message);

    await supabase.from("automation_logs").insert({
      agent_type: "autonomous-agent",
      action: "cycle_error",
      details: { cycleId, cycleType, error: error.message, engine: "lovable-ai-gemini" },
      status: "error",
      error_message: error.message,
      duration_ms: duration,
    });

    return new Response(JSON.stringify({ error: error.message, cycleId, cycleType }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
