import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Download, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ── Backlink Outreach Workbench ──────────────────────────────────────────────
// Admin-only systematic backlink building tool. Tracks targets, statuses, and
// reuses email/PR templates. Status persists in localStorage so this is a
// zero-backend control center the user can drive every day.

type Status = "todo" | "in-progress" | "submitted" | "live" | "rejected";
type Category =
  | "listing"
  | "directory"
  | "github"
  | "product-launch"
  | "guest-post"
  | "community"
  | "pr";
type Priority = "high" | "medium" | "low";

interface Target {
  id: string;
  name: string;
  url: string;
  category: Category;
  priority: Priority;
  authorityScore: number; // approx DA/AS
  followLink: boolean;
  cost: string; // "free", "$X", "review", etc.
  template: string; // template id to use
  notes: string;
}

const STATUS_KEY = "oraclebull:backlink-status:v1";
const NOTES_KEY = "oraclebull:backlink-notes:v1";

// ── Curated target list ──────────────────────────────────────────────────────
// Hand-picked for a brand-new crypto site (AS <10). Prioritized so users hit
// the highest-leverage, easiest-to-win targets first.
const TARGETS: Target[] = [
  // === TIER 1: Crypto listings (must-do, free, huge authority transfer) ===
  { id: "coingecko", name: "CoinGecko – Request Asset/Site Listing", url: "https://www.coingecko.com/en/coins/new", category: "listing", priority: "high", authorityScore: 91, followLink: true, cost: "free", template: "listing-coingecko", notes: "Requires deployed token OR list as an analytics platform via partnerships@coingecko.com" },
  { id: "coinmarketcap", name: "CoinMarketCap – Listings Request", url: "https://support.coinmarketcap.com/hc/en-us/articles/360043659351", category: "listing", priority: "high", authorityScore: 92, followLink: true, cost: "free", template: "listing-cmc", notes: "Submit via the official self-service form" },
  { id: "cryptopanic", name: "CryptoPanic – Add News Source", url: "https://cryptopanic.com/about/", category: "listing", priority: "high", authorityScore: 70, followLink: true, cost: "free", template: "listing-source", notes: "Add /insights RSS as a news source" },
  { id: "coinpaprika", name: "CoinPaprika – Add Project", url: "https://coinpaprika.com/about/", category: "listing", priority: "high", authorityScore: 75, followLink: true, cost: "free", template: "listing-generic", notes: "Email hello@coinpaprika.com" },
  { id: "defillama", name: "DefiLlama – Add Project", url: "https://docs.llama.fi/list-your-project/other-listings", category: "listing", priority: "high", authorityScore: 80, followLink: true, cost: "free", template: "listing-generic", notes: "GitHub PR — see docs" },
  { id: "coinscope", name: "Coinscope – Listing", url: "https://www.coinscope.co/", category: "listing", priority: "medium", authorityScore: 30, followLink: true, cost: "free", template: "listing-generic", notes: "Already linked once — add full site listing" },
  { id: "coinsniper", name: "CoinSniper – Submit", url: "https://coinsniper.net/", category: "listing", priority: "medium", authorityScore: 32, followLink: true, cost: "free", template: "listing-generic", notes: "Already linked once" },
  { id: "top100token", name: "Top100Token – Add Site", url: "https://top100token.com/", category: "listing", priority: "medium", authorityScore: 24, followLink: true, cost: "free", template: "listing-generic", notes: "Already linked once" },
  { id: "cryptorank", name: "CryptoRank – Add Project", url: "https://cryptorank.io/", category: "listing", priority: "high", authorityScore: 78, followLink: true, cost: "free", template: "listing-generic", notes: "" },

  // === TIER 1: Product launch platforms ===
  { id: "producthunt", name: "Product Hunt – Launch Day", url: "https://www.producthunt.com/", category: "product-launch", priority: "high", authorityScore: 91, followLink: true, cost: "free", template: "product-launch", notes: "Plan launch on a Tuesday/Wednesday. Build hunter network first." },
  { id: "betalist", name: "BetaList – Submit Startup", url: "https://betalist.com/submit", category: "product-launch", priority: "high", authorityScore: 80, followLink: true, cost: "free / $129 fast track", template: "product-launch", notes: "" },
  { id: "alternativeto", name: "AlternativeTo – Add App", url: "https://alternativeto.net/", category: "product-launch", priority: "medium", authorityScore: 85, followLink: false, cost: "free", template: "alternativeto", notes: "List as alternative to CoinGecko / CMC" },
  { id: "saashub", name: "SaaSHub – Submit Product", url: "https://www.saashub.com/submit-product", category: "product-launch", priority: "medium", authorityScore: 70, followLink: true, cost: "free", template: "product-launch", notes: "" },
  { id: "startupranking", name: "Startup Ranking – Add Startup", url: "https://www.startupranking.com/add-startup", category: "product-launch", priority: "medium", authorityScore: 67, followLink: true, cost: "free", template: "product-launch", notes: "" },

  // === TIER 1: GitHub awesome lists (free, follow-link, high authority) ===
  { id: "awesome-crypto", name: "GitHub – jslee02/awesome-cryptocurrency", url: "https://github.com/jslee02/awesome-cryptocurrency", category: "github", priority: "high", authorityScore: 96, followLink: true, cost: "free", template: "github-pr", notes: "Open PR adding Oracle Bull under Analytics / Prediction" },
  { id: "awesome-blockchain", name: "GitHub – yjjnls/awesome-blockchain", url: "https://github.com/yjjnls/awesome-blockchain", category: "github", priority: "high", authorityScore: 96, followLink: true, cost: "free", template: "github-pr", notes: "" },
  { id: "awesome-bitcoin", name: "GitHub – igorbarinov/awesome-bitcoin", url: "https://github.com/igorbarinov/awesome-bitcoin", category: "github", priority: "high", authorityScore: 96, followLink: true, cost: "free", template: "github-pr", notes: "" },
  { id: "awesome-defi", name: "GitHub – ong/awesome-decentralized-finance", url: "https://github.com/ong/awesome-decentralized-finance", category: "github", priority: "medium", authorityScore: 96, followLink: true, cost: "free", template: "github-pr", notes: "" },
  { id: "awesome-web3", name: "GitHub – maxonrails/awesome-web3", url: "https://github.com/maxonrails/awesome-web3", category: "github", priority: "medium", authorityScore: 96, followLink: true, cost: "free", template: "github-pr", notes: "" },

  // === TIER 2: Guest-post / blog targets ===
  { id: "hashnode", name: "Hashnode (your own blog + crypto tags)", url: "https://hashnode.com/", category: "guest-post", priority: "high", authorityScore: 82, followLink: true, cost: "free", template: "guest-post-platform", notes: "Cross-publish 2 articles/wk under crypto/web3 tags, canonical → oraclebull.com" },
  { id: "devto", name: "Dev.to – #crypto / #web3 tags", url: "https://dev.to/", category: "guest-post", priority: "high", authorityScore: 89, followLink: false, cost: "free", template: "guest-post-platform", notes: "Use canonical_url front-matter to point back" },
  { id: "medium-coinmonks", name: "Medium – Coinmonks publication", url: "https://medium.com/coinmonks/about", category: "guest-post", priority: "high", authorityScore: 95, followLink: false, cost: "free", template: "guest-post-pub", notes: "Apply as writer, links inside posts are OK" },
  { id: "medium-datadriveninvestor", name: "Medium – DataDrivenInvestor", url: "https://medium.datadriveninvestor.com/write-for-ddi-905b9b8f0e8", category: "guest-post", priority: "medium", authorityScore: 95, followLink: false, cost: "free", template: "guest-post-pub", notes: "" },
  { id: "hackernoon", name: "HackerNoon – Submit Story", url: "https://hackernoon.com/u/start-writing", category: "guest-post", priority: "high", authorityScore: 90, followLink: true, cost: "free", template: "guest-post-pub", notes: "Strong follow links" },
  { id: "cryptoslate-press", name: "CryptoSlate – Press Release", url: "https://cryptoslate.com/press/", category: "pr", priority: "medium", authorityScore: 80, followLink: true, cost: "paid", template: "press-release", notes: "" },
  { id: "ambcrypto-guest", name: "AMBCrypto – Sponsored / Guest", url: "https://ambcrypto.com/contact-us/", category: "pr", priority: "medium", authorityScore: 78, followLink: true, cost: "paid", template: "press-release", notes: "" },
  { id: "bitcoinist-pr", name: "Bitcoinist – Sponsored Post", url: "https://bitcoinist.com/advertise/", category: "pr", priority: "low", authorityScore: 79, followLink: true, cost: "paid", template: "press-release", notes: "" },
  { id: "newsbtc", name: "NewsBTC – Sponsored / Guest", url: "https://www.newsbtc.com/advertise/", category: "pr", priority: "low", authorityScore: 80, followLink: true, cost: "paid", template: "press-release", notes: "" },

  // === TIER 2: Communities (relationships → links) ===
  { id: "reddit-cc", name: "Reddit – r/CryptoCurrency", url: "https://www.reddit.com/r/CryptoCurrency/", category: "community", priority: "high", authorityScore: 91, followLink: false, cost: "free", template: "community-share", notes: "Share insights, NOT links. Read self-promo rules first." },
  { id: "reddit-cm", name: "Reddit – r/CryptoMarkets", url: "https://www.reddit.com/r/CryptoMarkets/", category: "community", priority: "high", authorityScore: 91, followLink: false, cost: "free", template: "community-share", notes: "" },
  { id: "reddit-altcoin", name: "Reddit – r/altcoin", url: "https://www.reddit.com/r/altcoin/", category: "community", priority: "medium", authorityScore: 91, followLink: false, cost: "free", template: "community-share", notes: "" },
  { id: "bitcointalk", name: "BitcoinTalk – Announcements", url: "https://bitcointalk.org/index.php?board=159.0", category: "community", priority: "medium", authorityScore: 86, followLink: false, cost: "free", template: "community-share", notes: "Build account rep first" },
  { id: "indiehackers", name: "Indie Hackers – Launch", url: "https://www.indiehackers.com/", category: "community", priority: "medium", authorityScore: 85, followLink: true, cost: "free", template: "ih-launch", notes: "" },

  // === TIER 3: Tool / directory niche ===
  { id: "g2", name: "G2 – Add Product", url: "https://www.g2.com/products/new", category: "directory", priority: "medium", authorityScore: 92, followLink: false, cost: "free", template: "listing-generic", notes: "Category: Crypto Analytics" },
  { id: "capterra", name: "Capterra – Add Software", url: "https://www.capterra.com/vendors/sign-up", category: "directory", priority: "medium", authorityScore: 90, followLink: false, cost: "free", template: "listing-generic", notes: "" },
  { id: "getapp", name: "GetApp – Add Product", url: "https://www.getapp.com/", category: "directory", priority: "low", authorityScore: 84, followLink: false, cost: "free", template: "listing-generic", notes: "" },
  { id: "f6s", name: "F6S – Startup Profile", url: "https://www.f6s.com/", category: "directory", priority: "low", authorityScore: 78, followLink: true, cost: "free", template: "listing-generic", notes: "" },
  { id: "crunchbase", name: "Crunchbase – Add Company", url: "https://www.crunchbase.com/", category: "directory", priority: "medium", authorityScore: 92, followLink: false, cost: "free", template: "listing-generic", notes: "Strong brand entity for Google" },
];

// ── Email / submission templates ─────────────────────────────────────────────
const TEMPLATES: Record<string, { subject: string; body: string; note?: string }> = {
  "listing-coingecko": {
    subject: "Partnership inquiry – Oracle Bull (AI crypto analytics platform)",
    body: `Hi CoinGecko team,

I run Oracle Bull (https://oraclebull.com), a free AI-powered crypto analytics and prediction platform. We aggregate market data, on-chain whale flows, and sentiment across 1,000+ assets and surface AI forecasts to retail traders.

We'd love to:
1. Be listed as an analytics partner / community resource on CoinGecko.
2. Explore integrating CoinGecko's public data feeds and crediting you as a source.

Would the partnerships team be open to a quick intro?

Thanks,
[Your name]
Oracle Bull – https://oraclebull.com`,
    note: "Send to partnerships@coingecko.com",
  },
  "listing-cmc": {
    subject: "Site/Tool listing request – Oracle Bull",
    body: `Hello,

I'd like to request a listing for Oracle Bull (https://oraclebull.com), a free AI-powered cryptocurrency analytics and price-prediction platform. We track 1,000+ assets across Ethereum, Solana, Base, Arbitrum and more, with whale tracking, sentiment analysis, and AI forecasting.

Category: Crypto Analytics / Tools
URL: https://oraclebull.com
Logo: https://oraclebull.com/oracle-bull-logo.jpg
Twitter: @oracle_bulls

Happy to provide any additional info needed.

Thanks,
[Your name]`,
  },
  "listing-source": {
    subject: "Add Oracle Bull as a news/analysis source",
    body: `Hi,

Oracle Bull (https://oraclebull.com) publishes daily AI-driven crypto market analysis, predictions, and on-chain insights. We'd like to be added as a news source.

RSS feed: https://oraclebull.com/insights
Site: https://oraclebull.com
Publishing cadence: 20+ articles/day, focused on market analysis, predictions, and whale activity.

Let me know if you need anything else.

Thanks,
[Your name]`,
  },
  "listing-generic": {
    subject: "Listing request – Oracle Bull (crypto analytics)",
    body: `Hi team,

I'd like to add Oracle Bull to your directory.

Name: Oracle Bull
URL: https://oraclebull.com
Category: Crypto analytics / AI predictions
Description (short): Free AI-powered cryptocurrency analytics, price predictions, whale tracking, and on-chain insights for retail traders.
Description (long): Oracle Bull aggregates real-time data from multiple chains (Ethereum, Solana, Base, Arbitrum, Polygon, Optimism, Avalanche, BNB) and combines it with AI forecasting, sentiment analysis from social platforms, and whale movement tracking. The platform serves daily/weekly/monthly price predictions across 1,000+ assets — fully free, ad-supported.
Logo: https://oraclebull.com/oracle-bull-logo.jpg
Contact: [your email]

Thanks,
[Your name]`,
  },
  "product-launch": {
    subject: "Oracle Bull – AI crypto analytics, free for everyone",
    body: `Tagline: Free AI-powered crypto analytics, predictions, and whale tracking for every trader.

Description:
Oracle Bull turns a wall of crypto noise into clear, AI-backed signals. Real-time prices, multi-horizon predictions, whale tracking, sentiment analysis, and on-chain insights across 1,000+ assets and 8 chains — 100% free, no signup required for read-only.

Key features:
• AI price predictions (daily, weekly, monthly) for 1,000+ assets
• Whale alerts and exchange netflow tracking
• Multi-chain analytics (ETH, SOL, Base, Arbitrum, Polygon, Optimism, Avalanche, BNB)
• Sentiment analysis across Twitter, Reddit, Telegram
• Wallet-connect personalization (no email, no spam)

Why we built it: institutional analytics shouldn't cost $500/mo. Oracle Bull is ad-supported so retail traders get the same intelligence whales pay for.

Launch URL: https://oraclebull.com
Maker: [your handle]
Topics: Crypto, FinTech, Analytics, AI, Web3`,
    note: "Tailor first/second sentence to each platform. For Product Hunt, schedule for 12:01am PST on a Tuesday/Wednesday.",
  },
  "alternativeto": {
    subject: "Oracle Bull – alternative to CoinGecko / CoinMarketCap",
    body: `Name: Oracle Bull
URL: https://oraclebull.com
Alternative to: CoinGecko, CoinMarketCap, CryptoCompare, Messari
Category: Crypto / Finance / Analytics
License: Free

Why it's an alternative:
Oracle Bull goes beyond price tracking with AI predictions, whale flow tracking, sentiment aggregation, and on-chain analytics — all in one free platform aimed at retail traders.`,
  },
  "github-pr": {
    subject: "[PR template] Add Oracle Bull to awesome list",
    body: `## What this PR adds

Adds **Oracle Bull** under the Analytics / Prediction section.

\`\`\`markdown
- [Oracle Bull](https://oraclebull.com) - Free AI-powered crypto analytics with multi-horizon price predictions, whale tracking, sentiment analysis, and on-chain insights across 8+ chains.
\`\`\`

## Why it belongs here
- 100% free, no signup wall, ad-supported
- Real production tool (not a stub) with 650+ indexed pages
- Multi-chain coverage (Ethereum, Solana, Base, Arbitrum, Polygon, Optimism, Avalanche, BNB)
- Active development and daily content

## Checklist
- [x] List is sorted alphabetically within section
- [x] One-line description under the suggested limit
- [x] Link verified working
- [x] No duplicate of existing entry`,
    note: "Fork → edit README.md → open PR. Keep description neutral and factual; maintainers reject promotional tone.",
  },
  "guest-post-platform": {
    subject: "(Not an email — cross-publish workflow)",
    body: `Workflow for Hashnode / Dev.to cross-posting:

1. Pick a strong existing article from /insights or /learn.
2. Copy the article body into the platform's editor.
3. In the front-matter / canonical field, set:
     canonical_url: https://oraclebull.com/insights/<slug>
   This tells Google the original is yours — Google credits Oracle Bull.
4. Add a short author bio at the bottom:
     "Originally published on Oracle Bull — free AI crypto analytics and predictions."
5. Use 3-5 relevant tags: crypto, web3, blockchain, bitcoin, ethereum, ai
6. Schedule 2 cross-posts per week per platform.

Net effect: 1 follow link (Hashnode) + 1 brand mention + 1 referral source per post.`,
  },
  "guest-post-pub": {
    subject: "Guest contribution pitch – Oracle Bull",
    body: `Hi editor,

I write at Oracle Bull (https://oraclebull.com), a free AI-powered crypto analytics platform. I'd love to contribute an original article to [Publication name].

Three article ideas tuned to your audience:

1. "What 24h Whale Netflows Actually Tell You – And What They Don't"
   A data-driven look at exchange inflow/outflow patterns across 90 days, with charts and concrete examples.

2. "Why Most AI Crypto Predictions Are Wrong (And How to Read Them Properly)"
   Honest breakdown of the math behind multi-horizon forecasts, what they predict well, what they don't.

3. "Reading the On-Chain Tape: A Practical Guide for Retail Traders"
   How to use free on-chain data the way institutional desks do.

Each post would be 1,200–1,800 words, original, with original charts. I'd link back to Oracle Bull once in the author bio (one of these in the article body if relevant).

Happy to send a full draft of any of these.

Thanks,
[Your name]
https://oraclebull.com`,
  },
  "press-release": {
    subject: "Press release / sponsored post inquiry – Oracle Bull",
    body: `Hi,

I'd like to publish a press release / sponsored article about Oracle Bull (https://oraclebull.com), a free AI-powered crypto analytics platform.

Could you send over:
- Pricing for a sponsored / press release placement
- Whether links are follow or nofollow
- Turnaround time
- Editorial guidelines
- Whether you accept pre-written content or write it in-house

Thanks,
[Your name]
https://oraclebull.com`,
    note: "Verify the link is follow BEFORE paying. Many crypto PR sites quietly use nofollow.",
  },
  "community-share": {
    subject: "(Not an email — community share template)",
    body: `RULES (read first):
• Most crypto subs ban link-drops. Build karma with comments first.
• Share INSIGHTS, not URLs. Mention the tool only in context.
• Read each sub's self-promo rules before posting.

Template post (insight-first, link in comments if asked):

Title: "Whale netflows on [token] flipped this week — what the data actually shows"

Body:
"Looking at exchange inflow/outflow on [X] over the past 7 days, the pattern shifted from net-outflow (accumulation) to net-inflow (distribution). Posting the raw numbers because I think the headline narrative around this token is missing context:

[paste 3-5 actual data points]

What it could mean:
1. [interpretation]
2. [counterpoint]
3. [risk]

Curious how others are reading it."

If asked where the data came from, reply with the Oracle Bull link. Never lead with the link.`,
  },
  "ih-launch": {
    subject: "Indie Hackers launch post",
    body: `Title: "I built a free AI crypto analytics platform — Oracle Bull is live"

Body:
After [N] months of building, Oracle Bull is live: https://oraclebull.com

What it is: Free AI-powered crypto analytics — price predictions, whale tracking, sentiment, on-chain data — across 1,000+ assets and 8 chains. No signup needed for read-only.

How it makes money: 100% ad-supported. Premium tier removed because it kept getting in the way of the actual product.

Tech stack: React + Vite, Supabase (Postgres + Edge Functions), Lovable AI Gateway for forecasts, multi-RPC infra for on-chain reads.

What I learned:
• [insight 1]
• [insight 2]
• [insight 3]

Looking for: honest feedback, especially from people who actually trade. What's missing?`,
  },
};

const categoryLabel: Record<Category, string> = {
  listing: "Crypto listing",
  directory: "Directory",
  github: "GitHub list",
  "product-launch": "Product launch",
  "guest-post": "Guest post",
  community: "Community",
  pr: "PR / paid",
};

const statusLabel: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  submitted: "Submitted",
  live: "Live ✓",
  rejected: "Rejected",
};

const statusColor: Record<Status, string> = {
  todo: "bg-muted text-foreground",
  "in-progress": "bg-amber-100 text-amber-900",
  submitted: "bg-blue-100 text-blue-900",
  live: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
};

function loadMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function BacklinkOutreach() {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<"all" | Category>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [activeTemplate, setActiveTemplate] = useState<string>("listing-generic");

  useEffect(() => {
    setStatuses(loadMap<Status>(STATUS_KEY));
    setNotes(loadMap<string>(NOTES_KEY));
  }, []);

  function setStatus(id: string, status: Status) {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    localStorage.setItem(STATUS_KEY, JSON.stringify(next));
  }

  function setNote(id: string, note: string) {
    const next = { ...notes, [id]: note };
    setNotes(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TARGETS.filter((t) => {
      if (filterCat !== "all" && t.category !== filterCat) return false;
      const s = statuses[t.id] ?? "todo";
      if (filterStatus !== "all" && s !== filterStatus) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.notes.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterCat, filterStatus, statuses]);

  const stats = useMemo(() => {
    const counts: Record<Status, number> = { todo: 0, "in-progress": 0, submitted: 0, live: 0, rejected: 0 };
    for (const t of TARGETS) counts[(statuses[t.id] ?? "todo") as Status]++;
    return counts;
  }, [statuses]);

  function copyTemplate(id: string) {
    const tpl = TEMPLATES[id];
    if (!tpl) return;
    const text = tpl.subject.startsWith("(")
      ? tpl.body
      : `Subject: ${tpl.subject}\n\n${tpl.body}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `Template "${id}" copied to clipboard.` });
  }

  function exportCsv() {
    const headers = ["name", "url", "category", "priority", "authority", "follow", "cost", "status", "notes"];
    const rows = TARGETS.map((t) => [
      t.name,
      t.url,
      t.category,
      t.priority,
      t.authorityScore.toString(),
      t.followLink ? "yes" : "no",
      t.cost,
      statuses[t.id] ?? "todo",
      (notes[t.id] ?? t.notes).replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backlink-outreach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Helmet>
        <title>Backlink Outreach – Admin</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Backlink Outreach Workbench</h1>
          <p className="text-muted-foreground mt-1">
            Systematic outreach to earn high-authority referring domains. Progress is saved locally in your browser.
          </p>
        </header>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {(Object.keys(stats) as Status[]).map((s) => (
            <Card key={s} className="p-4">
              <div className="text-xs text-muted-foreground">{statusLabel[s]}</div>
              <div className="text-2xl font-bold mt-1">{stats[s]}</div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="targets" className="w-full">
          <TabsList>
            <TabsTrigger value="targets">Targets ({TARGETS.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({Object.keys(TEMPLATES).length})</TabsTrigger>
            <TabsTrigger value="playbook">Playbook</TabsTrigger>
          </TabsList>

          <TabsContent value="targets" className="mt-4">
            <Card className="p-4 mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search targets…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterCat} onValueChange={(v) => setFilterCat(v as any)}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {(Object.keys(categoryLabel) as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{categoryLabel[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {(Object.keys(statusLabel) as Status[]).map((s) => (
                      <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={exportCsv} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {filtered.map((t) => {
                const status = statuses[t.id] ?? "todo";
                return (
                  <Card key={t.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{t.name}</h3>
                          <Badge variant="outline">{categoryLabel[t.category]}</Badge>
                          <Badge variant={t.priority === "high" ? "default" : "secondary"}>
                            {t.priority}
                          </Badge>
                          <Badge variant="outline">AS ~{t.authorityScore}</Badge>
                          <Badge variant={t.followLink ? "default" : "outline"}>
                            {t.followLink ? "follow" : "nofollow"}
                          </Badge>
                          <Badge variant="outline">{t.cost}</Badge>
                        </div>
                        {t.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{t.notes}</p>
                        )}
                        <Textarea
                          placeholder="Your notes (saved locally)…"
                          value={notes[t.id] ?? ""}
                          onChange={(e) => setNote(t.id, e.target.value)}
                          className="mt-3 min-h-[60px] text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:w-[220px] shrink-0">
                        <a href={t.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" /> Open
                          </Button>
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTemplate(t.template);
                            copyTemplate(t.template);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy template
                        </Button>
                        <Select value={status} onValueChange={(v) => setStatus(t.id, v as Status)}>
                          <SelectTrigger className={statusColor[status]}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(statusLabel) as Status[]).map((s) => (
                              <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">No targets match.</Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="grid md:grid-cols-[240px_1fr] gap-4">
              <Card className="p-3 h-fit">
                <div className="space-y-1">
                  {Object.keys(TEMPLATES).map((id) => (
                    <button
                      key={id}
                      onClick={() => setActiveTemplate(id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${activeTemplate === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                {(() => {
                  const tpl = TEMPLATES[activeTemplate];
                  if (!tpl) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{activeTemplate}</h3>
                        <Button size="sm" onClick={() => copyTemplate(activeTemplate)}>
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                      {!tpl.subject.startsWith("(") && (
                        <div className="mb-3">
                          <div className="text-xs text-muted-foreground mb-1">Subject</div>
                          <Input readOnly value={tpl.subject} />
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Body</div>
                        <Textarea readOnly value={tpl.body} className="min-h-[420px] font-mono text-xs" />
                      </div>
                      {tpl.note && (
                        <p className="text-xs text-muted-foreground mt-3">{tpl.note}</p>
                      )}
                    </>
                  );
                })()}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playbook" className="mt-4">
            <Card className="p-6 prose prose-sm max-w-none">
              <h2 className="text-xl font-bold">30-day backlink playbook</h2>
              <p>Order matters. Do not skip ahead — early tiers compound the later ones.</p>

              <h3 className="font-semibold mt-4">Week 1 — Free listings (target: 8 backlinks)</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Submit to CoinMarketCap, CoinGecko, CoinPaprika, CryptoRank, DefiLlama (free).</li>
                <li>Submit to Crunchbase, F6S, AlternativeTo, SaaSHub.</li>
                <li>Email CryptoPanic to add /insights RSS as a news source.</li>
              </ol>

              <h3 className="font-semibold mt-4">Week 2 — GitHub awesome lists (target: 4 follow links)</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Fork each awesome list, open clean PRs, one per week per repo.</li>
                <li>Use the github-pr template. Sort alphabetically. No promotional language.</li>
              </ol>

              <h3 className="font-semibold mt-4">Week 3 — Product launches (target: 3 launches)</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Product Hunt: schedule launch for Tuesday 12:01am PST. Recruit 20+ hunters in advance.</li>
                <li>BetaList, Indie Hackers, SaaSHub same week to amplify referral traffic.</li>
              </ol>

              <h3 className="font-semibold mt-4">Week 4 — Content distribution (target: ongoing)</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Cross-publish 2 articles/week to Hashnode and Dev.to with canonical → oraclebull.com.</li>
                <li>Pitch Coinmonks, HackerNoon, DataDrivenInvestor with the guest-post-pub template.</li>
                <li>Start building Reddit karma in r/CryptoCurrency / r/CryptoMarkets — insights only, no link drops.</li>
              </ol>

              <h3 className="font-semibold mt-4">What to avoid</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Fiverr guest-post packages.</strong> The backlink-checker shows your previous Fiverr link — these create spam footprints Google can detect, and most are nofollow garbage.</li>
                <li><strong>PBNs and link exchanges.</strong> Crypto is a YMYL niche — Google manually reviews. One penalty = months of recovery.</li>
                <li><strong>Mass-comment spam on crypto blogs.</strong> All nofollow, all reputation damage.</li>
                <li><strong>Buying paid PR before checking follow status.</strong> Always confirm follow/nofollow in writing before paying.</li>
              </ul>

              <h3 className="font-semibold mt-4">Tracking what works</h3>
              <p className="text-sm">After 30 days, recheck Authority Score via the Semrush tool. Goal: AS 2 → AS 10+ in 60 days. Real ranking lift follows ~90 days behind.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}