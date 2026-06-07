// ──────────────────────────────────────────────────────────────────────────────
// news-feed — public, read-only API over the persisted news in `blog_articles`
// (source = 'news'). Powers the /news hub (list + category + search + paging)
// and /news/<slug> (single article + related). Lightweight: no AI, no writes.
//
// POST body:
//   { slug }                         → { article, related }
//   { q?, category?, limit?, offset? } → { articles, total, categories }
//
// On any failure it returns empty, well-shaped JSON so the UI degrades cleanly.
// ──────────────────────────────────────────────────────────────────────────────
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SELECT =
  "article_id, title, slug, meta_title, meta_description, content, takeaways, faqs, category, read_time, word_count, published_at, image_url, primary_keyword, secondary_keywords, external_url, source_name, source_icon, sentiment, coins";

// Stable display order for the category filter on the hub.
const CATEGORY_ORDER = ["Bitcoin", "Ethereum", "Solana", "Markets", "DeFi", "Regulation", "Memecoins", "AI", "NFTs", "Mining", "Crypto"];

function mapRow(r: Record<string, any>) {
  return {
    id: r.article_id,
    title: r.title,
    slug: r.slug,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    content: r.content,
    takeaways: r.takeaways || [],
    faqs: r.faqs || [],
    category: r.category,
    readTime: r.read_time,
    wordCount: r.word_count,
    publishedAt: r.published_at,
    imageUrl: r.image_url,
    primaryKeyword: r.primary_keyword,
    secondaryKeywords: r.secondary_keywords || [],
    externalUrl: r.external_url,
    sourceName: r.source_name,
    sourceIcon: r.source_icon,
    sentiment: r.sentiment,
    coins: r.coins || [],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Single article by slug ──────────────────────────────────────────────
    if (body?.slug) {
      const { data: rows } = await supabase
        .from("blog_articles")
        .select(SELECT)
        .eq("source", "news")
        .eq("slug", body.slug)
        .limit(1);

      const article = rows && rows.length ? mapRow(rows[0]) : null;

      let related: ReturnType<typeof mapRow>[] = [];
      if (article) {
        const { data: rel } = await supabase
          .from("blog_articles")
          .select(SELECT)
          .eq("source", "news")
          .eq("category", article.category)
          .neq("slug", article.slug)
          .order("published_at", { ascending: false })
          .limit(5);
        related = (rel || []).map(mapRow);
        // Top up with newest from any category if the category is thin.
        if (related.length < 4) {
          const { data: more } = await supabase
            .from("blog_articles")
            .select(SELECT)
            .eq("source", "news")
            .neq("slug", article.slug)
            .order("published_at", { ascending: false })
            .limit(8);
          const have = new Set(related.map((r) => r.slug));
          for (const m of (more || []).map(mapRow)) {
            if (related.length >= 4) break;
            if (!have.has(m.slug)) { related.push(m); have.add(m.slug); }
          }
        }
      }

      return new Response(JSON.stringify({ article, related }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      });
    }

    // ── List / search ───────────────────────────────────────────────────────
    const limit = Math.min(Math.max(Number(body?.limit) || 30, 1), 60);
    const offset = Math.max(Number(body?.offset) || 0, 0);
    const category = typeof body?.category === "string" && body.category !== "All" ? body.category : null;
    const q = typeof body?.q === "string" ? body.q.trim().slice(0, 80) : "";

    let query = supabase
      .from("blog_articles")
      .select(SELECT, { count: "exact" })
      .eq("source", "news")
      .order("published_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data: rows, count } = await query.range(offset, offset + limit - 1);

    // Distinct categories present (for the filter bar), in stable order.
    const { data: catRows } = await supabase
      .from("blog_articles")
      .select("category")
      .eq("source", "news")
      .limit(1000);
    const present = new Set((catRows || []).map((c: { category: string }) => c.category));
    const categories = CATEGORY_ORDER.filter((c) => present.has(c));

    return new Response(
      JSON.stringify({
        articles: (rows || []).map(mapRow),
        total: count || 0,
        categories,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=120" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ articles: [], total: 0, categories: [], article: null, related: [], error: String(error) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
