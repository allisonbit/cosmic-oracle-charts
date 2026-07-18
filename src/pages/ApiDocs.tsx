import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE_URL } from "@/lib/siteConfig";

const BASE = "https://oraclebull.com/api/v1";

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950 text-slate-100 text-xs md:text-sm p-4 rounded-lg overflow-x-auto"><code>{children}</code></pre>
  );
}

function Endpoint({ method, path, desc, req, res }: { method: string; path: string; desc: string; req: string; res: string }) {
  return (
    <Card className="p-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-green-500/15 text-green-700 border-green-500/30">{method}</Badge>
        <code className="font-mono text-sm md:text-base">{path}</code>
      </div>
      <p className="text-muted-foreground text-sm">{desc}</p>
      <div>
        <div className="text-xs uppercase text-muted-foreground mb-1">Request</div>
        <Code>{req}</Code>
      </div>
      <div>
        <div className="text-xs uppercase text-muted-foreground mb-1">Response 200</div>
        <Code>{res}</Code>
      </div>
    </Card>
  );
}

export default function ApiDocs() {
  const canonical = `${SITE_URL}/api-docs`;
  return (
    <Layout>
      <Helmet>
        <title>Oracle Bull Public API — Free Crypto Prices & AI Predictions</title>
        <meta name="description" content="Free REST API for real-time crypto prices, trending coins, and AI-generated price predictions. Rate-limited, cached, no key required." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Badge variant="outline" className="mb-3">Developers</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Public API</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Free, no-key REST API for Oracle Bull data. Perfect for dashboards, bots, and research notebooks.
        </p>

        <Card className="p-5 my-6 bg-primary/5 border-primary/20">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div><div className="text-muted-foreground">Base URL</div><code className="font-mono">{BASE}</code></div>
            <div><div className="text-muted-foreground">Auth</div>None — public</div>
            <div><div className="text-muted-foreground">Rate limit</div>60 req/min per IP</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Responses include <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>. When throttled you get HTTP 429 with <code>Retry-After</code>. Responses are edge-cached 30–300s and served with <code>stale-while-revalidate</code>.
          </p>
        </Card>

        <div className="space-y-6">
          <Endpoint
            method="GET"
            path="/api/v1/trending"
            desc="Top gainers and losers over the last 24h from the top-50 market-cap universe. Cached 60s."
            req={`curl "${BASE}/trending"`}
            res={`{
  "updated_at": "2026-07-18T09:12:03.412Z",
  "gainers": [
    { "id": "solana", "symbol": "sol", "name": "Solana",
      "price": 214.87, "change_24h_pct": 8.42 }
  ],
  "losers": [
    { "id": "dogecoin", "symbol": "doge", "name": "Dogecoin",
      "price": 0.171, "change_24h_pct": -6.11 }
  ]
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/price/:coin"
            desc="Real-time USD price, 24h change, market cap, and last-updated timestamp. :coin is a CoinGecko id (e.g. bitcoin, ethereum, solana). Cached 30s."
            req={`curl "${BASE}/price/bitcoin"`}
            res={`{
  "coin": "bitcoin",
  "price_usd": 118432.51,
  "change_24h_pct": 2.17,
  "market_cap_usd": 2331000000000,
  "updated_at": "2026-07-18T09:12:00.000Z"
}`}
          />

          <Endpoint
            method="GET"
            path="/api/v1/prediction/:coin/:timeframe"
            desc="Latest AI-generated prediction for a coin. Timeframe is daily | weekly | monthly. Cached 120s."
            req={`curl "${BASE}/prediction/ethereum/weekly"`}
            res={`{
  "coin_id": "ethereum",
  "symbol": "eth",
  "timeframe": "weekly",
  "bias": "bullish",
  "confidence": 72,
  "target_low": 3820.5,
  "target_high": 4180.0,
  "rationale": "Momentum indicators aligned with rising open interest...",
  "expires_at": "2026-07-25T00:00:00.000Z",
  "updated_at": "2026-07-18T06:00:00.000Z",
  "source": "oraclebull.com"
}`}
          />
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-3">Errors</h2>
        <Card className="p-5">
          <ul className="text-sm space-y-2">
            <li><code>400 invalid_timeframe</code> — timeframe must be daily/weekly/monthly.</li>
            <li><code>404 coin_not_found</code> — coin id not in upstream registry.</li>
            <li><code>404 no_active_prediction</code> — no fresh cached prediction for that pair.</li>
            <li><code>429 rate_limited</code> — respect the <code>Retry-After</code> header.</li>
            <li><code>502 upstream_unavailable</code> — retry with backoff.</li>
          </ul>
        </Card>

        <h2 className="text-2xl font-bold mt-10 mb-3">Fair-use</h2>
        <p className="text-muted-foreground text-sm max-w-3xl">
          The API is free for personal, research, and small-scale commercial use. Cache responses on your side, back off on 429s, and please credit <a className="text-primary underline" href="https://oraclebull.com">oraclebull.com</a> in public projects.
        </p>
      </div>
    </Layout>
  );
}