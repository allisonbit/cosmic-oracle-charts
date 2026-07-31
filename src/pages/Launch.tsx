import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Copy, Check, Rocket, Code2, Newspaper } from "lucide-react";

const HN_TITLE = "Show HN: Oracle Bull – free public API for real-time crypto prices, AI predictions, and sentiment";
const HN_BODY = `Hi HN — I built Oracle Bull, a free crypto intelligence platform. It's ad-supported and 100% free.

The public API (https://oraclebull.com/api-docs) exposes:
- Real-time prices for 10k+ tokens (multi-source: DexScreener, CoinGecko, CryptoCompare fallbacks)
- AI price predictions (daily / weekly / monthly, resolved and scored publicly at /accuracy)
- Sentiment aggregation across Twitter / Reddit / Telegram
- Whale-flow deltas from Alchemy (BTC/ETH/SOL/BASE)

All endpoints are rate-limited + cached at the edge. No signup, no keys. Curl-friendly JSON.

I'd love feedback on the API shape and what endpoints would actually be useful.`;

const PH_TAGLINE = "Free real-time crypto prices, AI predictions & sentiment API — no signup";
const PH_DESCRIPTION = `Oracle Bull is a free crypto intelligence platform with a public JSON API. Get real-time prices, AI-graded price predictions (with a public accuracy leaderboard), sentiment scores, and whale flows — all rate-limited, cached, and keyless. Ad-supported, no signup required.`;

const DEVTO_TITLE = "I built a free crypto prediction API you can hit without signup";
const DEVTO_BODY = `# Free crypto prediction API — no signup, no keys

**TL;DR** — https://oraclebull.com/api-docs. Free, rate-limited, cached.

## Why
Every "free" crypto API I hit either capped at 30 req/min after signup or forced me into a paid tier by request #5. So I shipped one that's genuinely free and ad-supported.

## What's inside
\`\`\`bash
curl https://oraclebull.com/api/v1/price/bitcoin
curl https://oraclebull.com/api/v1/predict/ethereum/weekly
curl https://oraclebull.com/api/v1/sentiment/solana
\`\`\`

## Transparency
Every prediction is graded against real market prices and published at /accuracy — no cherry-picking.

## Feedback wanted
What endpoints would you actually use? Reply here or open an issue.`;

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">{text}</pre>
    </div>
  );
}

export default function Launch() {
  return (
    <Layout>
      <Helmet>
        <title>API Launch Kit — Oracle Bull</title>
        <meta name="description" content="Ready-to-post copy for launching the Oracle Bull public crypto API on Product Hunt, Hacker News, and Dev.to." />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium mb-3">
          <Rocket className="w-3.5 h-3.5" /> Internal launch kit
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Public API Launch Kit</h1>
        <p className="text-slate-600 mb-8">
          Copy-ready posts to launch <Link className="text-blue-600 underline" to="/api-docs">/api-docs</Link> on Product Hunt, Hacker News, and Dev.to.
          Post from your own accounts — each links back for referral traffic and backlinks.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <a href="https://www.producthunt.com/posts/new" target="_blank" rel="noopener" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition">
            <Rocket className="w-5 h-5 text-orange-500 mb-2" />
            <div className="font-semibold text-slate-900">Product Hunt</div>
            <div className="text-xs text-slate-500 mt-1">Submit new product →</div>
          </a>
          <a href="https://news.ycombinator.com/submit" target="_blank" rel="noopener" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition">
            <Newspaper className="w-5 h-5 text-orange-600 mb-2" />
            <div className="font-semibold text-slate-900">Hacker News</div>
            <div className="text-xs text-slate-500 mt-1">Show HN submission →</div>
          </a>
          <a href="https://dev.to/new" target="_blank" rel="noopener" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition">
            <Code2 className="w-5 h-5 text-slate-900 mb-2" />
            <div className="font-semibold text-slate-900">Dev.to</div>
            <div className="text-xs text-slate-500 mt-1">Write a post →</div>
          </a>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Hacker News</h2>
            <div className="space-y-3">
              <CopyBlock label="Title" text={HN_TITLE} />
              <CopyBlock label="Body" text={HN_BODY} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Product Hunt</h2>
            <div className="space-y-3">
              <CopyBlock label="Tagline (60 chars)" text={PH_TAGLINE} />
              <CopyBlock label="Description" text={PH_DESCRIPTION} />
              <CopyBlock label="First comment" text={`Hey PH! Maker here. Oracle Bull started as a personal crypto dashboard and ended up as a free public API. Everything you see on the site is available as JSON: prices, AI predictions, sentiment, whale flows. No signup, no keys, rate-limited fairly. Happy to answer any technical questions in the thread.`} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Dev.to</h2>
            <div className="space-y-3">
              <CopyBlock label="Title" text={DEVTO_TITLE} />
              <CopyBlock label="Body (Markdown)" text={DEVTO_BODY} />
              <CopyBlock label="Tags" text="crypto, api, showdev, webdev" />
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
