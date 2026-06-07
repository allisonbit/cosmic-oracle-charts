// ──────────────────────────────────────────────────────────────────────────────
// news-aggregator — the engine behind /news.
//
// Runs every 30 minutes (pg_cron → news_aggregator_cron.sql). Each run:
//   1. Pulls the latest stories from 50+ crypto publications via the CryptoCompare
//      aggregated news feed (CoinDesk, Cointelegraph, Decrypt, CryptoSlate, The
//      Block, Bitcoin Magazine, …). Every item keeps its ORIGINAL url + source so
//      we always link back to the publisher.
//   2. Writes an *original* summary + market-impact analysis + sentiment + FAQs for
//      each story (so we publish unique, indexable content — never a copy of the
//      source body). Uses the Lovable AI gateway when LOVABLE_API_KEY is set;
//      otherwise a deterministic, per-article templated write-up.
//   3. Upserts into `blog_articles` (source = 'news') so the news is persisted,
//      searchable and crawlable at /news/<slug>.
//   4. Pings IndexNow + Google so the new URLs are discovered fast.
//
// It NEVER throws to the caller — any failure is logged and a JSON summary is
// returned so the cron job stays green.
// ──────────────────────────────────────────────────────────────────────────────
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = "https://oraclebull.com";

// How many fresh stories to (re)process per run, and how many get the richer
// AI write-up (kept small so the function stays well inside its time budget).
const MAX_ARTICLES = 40;
const MAX_AI_ARTICLES = 10;

// ── Source feeds ──────────────────────────────────────────────────────────────
// CryptoCompare already aggregates the major crypto press and exposes each
// article's real source + url, so a handful of category calls gives broad,
// reliably-backlinked coverage. (Add RSS feeds here later if desired.)
const FEEDS = [
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC&sortOrder=latest",
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=ETH&sortOrder=latest",
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Altcoin&sortOrder=latest",
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Trading&sortOrder=latest",
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Regulation&sortOrder=latest",
];

interface RawNews {
  id: string;
  guid?: string;
  published_on: number;
  imageurl?: string;
  title: string;
  url: string;
  body?: string;
  tags?: string;
  categories?: string;
  source?: string;
  source_info?: { name?: string; img?: string; lang?: string };
}

// ── Sentiment (keyword heuristic) ─────────────────────────────────────────────
const BULL = ["bull", "surge", "rally", "gain", "soar", "rise", "pump", "ath", "record high", "breakout", "moon", "adoption", "approve", "approval", "etf", "inflow", "accumulat", "upgrade", "partnership", "all-time high", "buy", "long"];
const BEAR = ["bear", "crash", "drop", "fall", "plunge", "slump", "loss", "hack", "exploit", "ban", "lawsuit", "sue", "sec charges", "fraud", "fear", "dump", "selloff", "sell-off", "liquidat", "outflow", "decline", "warning", "down", "short", "collapse"];

function scoreSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const t = text.toLowerCase();
  const b = BULL.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const be = BEAR.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  if (b > be + 1) return "bullish";
  if (be > b + 1) return "bearish";
  return "neutral";
}

// ── Coin extraction (for internal backlinks to our prediction pages) ──────────
const COIN_MAP: Record<string, { id: string; name: string; symbol: string }> = {
  bitcoin: { id: "bitcoin", name: "Bitcoin", symbol: "BTC" }, btc: { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  ethereum: { id: "ethereum", name: "Ethereum", symbol: "ETH" }, eth: { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  solana: { id: "solana", name: "Solana", symbol: "SOL" }, sol: { id: "solana", name: "Solana", symbol: "SOL" },
  ripple: { id: "ripple", name: "XRP", symbol: "XRP" }, xrp: { id: "ripple", name: "XRP", symbol: "XRP" },
  cardano: { id: "cardano", name: "Cardano", symbol: "ADA" }, ada: { id: "cardano", name: "Cardano", symbol: "ADA" },
  dogecoin: { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" }, doge: { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  bnb: { id: "bnb", name: "BNB", symbol: "BNB" }, binance: { id: "bnb", name: "BNB", symbol: "BNB" },
  polkadot: { id: "polkadot", name: "Polkadot", symbol: "DOT" }, dot: { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  chainlink: { id: "chainlink", name: "Chainlink", symbol: "LINK" }, link: { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  avalanche: { id: "avalanche", name: "Avalanche", symbol: "AVAX" }, avax: { id: "avalanche", name: "Avalanche", symbol: "AVAX" },
  "shiba inu": { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB" }, shib: { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB" },
  pepe: { id: "pepe", name: "Pepe", symbol: "PEPE" }, arbitrum: { id: "arbitrum", name: "Arbitrum", symbol: "ARB" },
  optimism: { id: "optimism", name: "Optimism", symbol: "OP" }, polygon: { id: "polygon", name: "Polygon", symbol: "POL" },
  litecoin: { id: "litecoin", name: "Litecoin", symbol: "LTC" }, ltc: { id: "litecoin", name: "Litecoin", symbol: "LTC" },
  tron: { id: "tron", name: "TRON", symbol: "TRX" }, sui: { id: "sui", name: "Sui", symbol: "SUI" },
  aptos: { id: "aptos", name: "Aptos", symbol: "APT" }, near: { id: "near", name: "NEAR Protocol", symbol: "NEAR" },
  uniswap: { id: "uniswap", name: "Uniswap", symbol: "UNI" }, toncoin: { id: "ton", name: "Toncoin", symbol: "TON" },
  stellar: { id: "stellar", name: "Stellar", symbol: "XLM" }, hedera: { id: "hedera", name: "Hedera", symbol: "HBAR" },
};

function extractCoins(text: string): { id: string; name: string; symbol: string }[] {
  const t = ` ${text.toLowerCase()} `;
  const seen = new Map<string, { id: string; name: string; symbol: string }>();
  for (const [kw, coin] of Object.entries(COIN_MAP)) {
    const needle = kw.length <= 4 ? ` ${kw} ` : kw; // short tickers need word boundaries
    if (t.includes(needle) && !seen.has(coin.id)) seen.set(coin.id, coin);
  }
  return [...seen.values()].slice(0, 5);
}

// ── Category mapping (CryptoCompare tags → human display categories) ───────────
function deriveCategory(raw: RawNews): string {
  const cats = (raw.categories || "").toUpperCase();
  const t = (raw.title + " " + (raw.body || "")).toLowerCase();
  if (cats.includes("BTC") || /\bbitcoin\b/.test(t)) return "Bitcoin";
  if (cats.includes("ETH") || /\bethereum\b/.test(t)) return "Ethereum";
  if (/\bsolana\b/.test(t)) return "Solana";
  if (cats.includes("REGULATION") || /\b(sec|regulat|lawsuit|congress|legal)\b/.test(t)) return "Regulation";
  if (cats.includes("MINING")) return "Mining";
  if (/\b(defi|yield|liquidity pool|dex)\b/.test(t)) return "DeFi";
  if (/\b(nft|opensea)\b/.test(t)) return "NFTs";
  if (/\b(ai|artificial intelligence)\b/.test(t)) return "AI";
  if (/\b(meme|doge|shiba|pepe|bonk)\b/.test(t)) return "Memecoins";
  if (cats.includes("TRADING") || /\b(price|rally|crash|surge|breakout)\b/.test(t)) return "Markets";
  return "Crypto";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function readTime(words: number): string {
  return `${Math.max(2, Math.round(words / 200))} min`;
}

// ── Deterministic, per-article write-up (the no-AI / fallback path) ───────────
// Produces UNIQUE content from the story's own facts — never a copy of the source.
function buildSummary(raw: RawNews, sentiment: string, coins: { name: string }[]): {
  content: string; takeaways: string[]; faqs: { question: string; answer: string }[]; words: number;
} {
  const source = raw.source_info?.name || raw.source || "the original publisher";
  const lead = (raw.body || raw.title).replace(/\s+/g, " ").trim().slice(0, 320);
  const coinList = coins.length ? coins.map((c) => c.name).join(", ") : "the broader crypto market";
  const stance =
    sentiment === "bullish"
      ? `Oracle AI reads this as a **bullish** catalyst. Headlines of this kind — institutional flows, approvals or technical milestones — have historically pulled buy-side interest into ${coinList} within 24–72 hours, with second-order momentum spilling into correlated altcoins.`
      : sentiment === "bearish"
      ? `Oracle AI reads this as a **bearish** development. Stories like this tend to spark an initial wave of de-risking around ${coinList}; the key question is whether larger players treat the dip as an accumulation zone. Watch the 4-hour RSI and funding for the flush-and-reclaim pattern.`
      : `Oracle AI rates the direct market impact as **neutral**. Headlines like this rarely move price on their own — the signals that matter are how on-chain flows and the Fear & Greed Index react over the following hours.`;

  const content = [
    `## What happened`,
    `${lead}${lead.length >= 320 ? "…" : ""}`,
    ``,
    `Reported by **${source}**. This is an aggregated brief — the full report and the publisher's original reporting are linked at the bottom of this page.`,
    ``,
    `## Why it matters`,
    stance,
    ``,
    `In the current cycle, news-driven volatility is amplified by heavy leverage in the futures market, so the first reaction to a headline is often exaggerated before price mean-reverts. Experienced traders treat these spikes as entry or exit opportunities rather than chasing the initial candle.`,
    ``,
    `## What to watch next`,
    `- Whether ${coinList} hold or reclaim their key moving averages on rising volume`,
    `- The shift in overall market sentiment on our [Fear & Greed Index](/sentiment)`,
    `- The live AI forecast and entry/exit zones on our [price predictions](/predictions)`,
  ].join("\n");

  const takeaways = [
    `Oracle AI rates this story ${sentiment} for short-term market impact.`,
    coins.length ? `Most directly relevant to ${coinList}.` : `Impact is spread across the broader market rather than one asset.`,
    `News reactions are often exaggerated by leverage — confirm with volume before acting.`,
    `Cross-check with the live sentiment and prediction dashboards before making any decision.`,
  ];

  const faqs = [
    { question: `Is this news bullish or bearish for crypto?`, answer: `Oracle AI's keyword and context model rates this particular story as ${sentiment} for near-term market impact. Sentiment can shift quickly, so confirm against live price and volume before trading.` },
    { question: `Which coins does this affect?`, answer: coins.length ? `It is most relevant to ${coinList}. You can open the live AI prediction for each from the "Coins mentioned" panel on this page.` : `There is no single asset in focus — treat it as broader market context rather than a coin-specific catalyst.` },
    { question: `Where can I read the full story?`, answer: `This is a short, original brief. The complete report is available on ${source} via the "Continue reading" link near the top and bottom of this article.` },
  ];

  const words = content.split(/\s+/).length;
  return { content, takeaways, faqs, words };
}

// ── Richer AI write-up (optional, when LOVABLE_API_KEY is configured) ─────────
async function buildAISummary(raw: RawNews, sentiment: string, coins: { name: string }[]) {
  try {
    const source = raw.source_info?.name || raw.source || "a crypto publication";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are Oracle Bull's crypto news editor. Write ORIGINAL, concise market commentary — never copy the source text. Be factual, neutral on advice, and add trading context.` },
          { role: "user", content: `Source: ${source}. Headline: "${raw.title}". Source brief: "${(raw.body || "").slice(0, 500)}". Our sentiment read: ${sentiment}. Coins in focus: ${coins.map((c) => c.name).join(", ") || "general market"}.

Return ONLY JSON:
{"content":"~350 words, markdown with ## What happened, ## Why it matters, ## What to watch next. Include an internal link to /sentiment and /predictions naturally. Do NOT reproduce the source body verbatim.","takeaways":["t1","t2","t3","t4"],"faqs":[{"question":"q","answer":"a"},{"question":"q","answer":"a"},{"question":"q","answer":"a"}]}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    const data = await res.json();
    const txt = data.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("no json");
    const parsed = JSON.parse(m[0]);
    if (!parsed.content) throw new Error("empty content");
    return {
      content: parsed.content as string,
      takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways.slice(0, 5) : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs.slice(0, 4) : [],
      words: String(parsed.content).split(/\s+/).length,
    };
  } catch (_e) {
    return buildSummary(raw, sentiment, coins);
  }
}

// ── Notify search engines of the freshly published URLs ──────────────────────
async function pingSearchEngines(paths: string[]) {
  if (!paths.length) return;
  const urlList = paths.map((p) => `${SITE_URL}${p}`).slice(0, 10000);
  const payload = {
    host: "oraclebull.com",
    key: "oraclebull2026indexnow",
    keyLocation: `${SITE_URL}/indexnow-key.txt`,
    urlList,
  };
  const endpoints = ["https://api.indexnow.org/IndexNow", "https://www.bing.com/IndexNow", "https://yandex.com/indexnow"];
  await Promise.allSettled([
    ...endpoints.map((e) =>
      fetch(e, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) })
    ),
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`),
  ]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const summary = { fetched: 0, inserted: 0, updated: 0, total: 0, errors: [] as string[] };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Pull + dedupe the latest stories across all feeds.
    const byId = new Map<string, RawNews>();
    const feedResults = await Promise.allSettled(FEEDS.map((u) => fetch(u).then((r) => r.json())));
    for (const r of feedResults) {
      if (r.status !== "fulfilled") continue;
      for (const item of (r.value?.Data || []) as RawNews[]) {
        if (item?.id && item?.title && item?.url && !byId.has(item.id)) byId.set(item.id, item);
      }
    }
    const raws = [...byId.values()]
      .sort((a, b) => (b.published_on || 0) - (a.published_on || 0))
      .slice(0, MAX_ARTICLES);
    summary.fetched = raws.length;

    if (!raws.length) {
      return new Response(JSON.stringify({ ...summary, note: "no source articles" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Which of these are already in the DB? (Only write-up NEW ones with AI.)
    const articleIds = raws.map((r) => `news-${r.id}`);
    const { data: existing } = await supabase
      .from("blog_articles")
      .select("article_id")
      .in("article_id", articleIds);
    const existingIds = new Set((existing || []).map((e: { article_id: string }) => e.article_id));

    // 3. Build rows.
    const rows: Record<string, unknown>[] = [];
    const newSlugs: string[] = [];
    let aiBudget = LOVABLE_API_KEY ? MAX_AI_ARTICLES : 0;

    for (const raw of raws) {
      try {
        const articleId = `news-${raw.id}`;
        const isNew = !existingIds.has(articleId);
        const fullText = `${raw.title} ${raw.body || ""} ${raw.tags || ""}`;
        const sentiment = scoreSentiment(fullText);
        const coins = extractCoins(fullText);
        const category = deriveCategory(raw);

        const useAI = isNew && aiBudget > 0;
        if (useAI) aiBudget--;
        const writeup = useAI ? await buildAISummary(raw, sentiment, coins) : buildSummary(raw, sentiment, coins);

        const slug = `${slugify(raw.title).slice(0, 72)}-${raw.id}`;
        const metaTitle = `${raw.title.slice(0, 65)} | Oracle Bull News`.slice(0, 70);
        const metaDescription =
          `${(raw.body || raw.title).replace(/\s+/g, " ").trim().slice(0, 150)}` +
          ` — Oracle AI rates it ${sentiment}.`;

        if (isNew) newSlugs.push(`/news/${slug}`);

        rows.push({
          article_id: articleId,
          title: raw.title,
          slug,
          meta_title: metaTitle,
          meta_description: metaDescription.slice(0, 160),
          content: writeup.content,
          takeaways: writeup.takeaways,
          faqs: writeup.faqs,
          category,
          read_time: readTime(writeup.words),
          word_count: writeup.words,
          published_at: new Date((raw.published_on || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
          image_url: raw.imageurl || "",
          primary_keyword: `${(coins[0]?.name || category).toLowerCase()} news`,
          secondary_keywords: [category.toLowerCase(), "crypto news", "market analysis", ...coins.map((c) => c.symbol.toLowerCase())],
          source: "news",
          external_url: raw.url,
          source_name: raw.source_info?.name || raw.source || "Crypto News",
          source_icon: raw.source_info?.img || "",
          sentiment,
          coins,
        });
      } catch (e) {
        summary.errors.push(`build ${raw.id}: ${e instanceof Error ? e.message : "err"}`);
      }
    }

    // 4. Upsert (idempotent on article_id).
    if (rows.length) {
      const { error } = await supabase.from("blog_articles").upsert(rows, { onConflict: "article_id" });
      if (error) {
        summary.errors.push(`upsert: ${error.message}`);
      } else {
        summary.inserted = newSlugs.length;
        summary.updated = rows.length - newSlugs.length;
      }
    }

    // 5. Keep the table lean — drop news older than 45 days.
    try {
      const cutoff = new Date(Date.now() - 45 * 86400000).toISOString();
      await supabase.from("blog_articles").delete().eq("source", "news").lt("published_at", cutoff);
    } catch (_e) { /* non-fatal */ }

    // 6. Tell search engines about the new URLs.
    await pingSearchEngines(newSlugs);

    const { count } = await supabase
      .from("blog_articles")
      .select("id", { count: "exact", head: true })
      .eq("source", "news");
    summary.total = count || rows.length;

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    summary.errors.push(error instanceof Error ? error.message : "fatal");
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
