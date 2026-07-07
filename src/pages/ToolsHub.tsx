import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Calculator, TrendingDown, Droplets, Gauge, Search, Zap, Activity,
  GitCompare, Flame, BarChart3, ArrowRight, Sparkles, Wrench,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";

// Real /tools hub. Every tool lives on its OWN route (separate page); this hub
// just links to them with real <Link> anchors so both users and crawlers can
// discover the full toolset. Polymarket is now its own page at /polymarket.
const TOOLS = [
  {
    to: "/tools/profit-calculator",
    label: "Crypto Profit Calculator",
    desc: "Calculate exact trading profit, ROI and break-even after exchange fees on both sides.",
    icon: Calculator,
  },
  {
    to: "/tools/dca-calculator",
    label: "DCA Calculator",
    desc: "Model a dollar-cost-averaging plan and project your average entry and returns over time.",
    icon: TrendingDown,
  },
  {
    to: "/tools/impermanent-loss-calculator",
    label: "Impermanent Loss Calculator",
    desc: "Estimate impermanent loss for an AMM liquidity pool before you provide liquidity.",
    icon: Droplets,
  },
  {
    to: "/scanner",
    label: "Token Scanner",
    desc: "Scan thousands of tokens across every chain for new listings, volume and risk signals.",
    icon: Search,
  },
  {
    to: "/crypto-strength-meter",
    label: "Crypto Strength Meter",
    desc: "Live 0–100 strength rankings for Bitcoin, Ethereum, Solana and 100+ assets.",
    icon: Zap,
  },
  {
    to: "/sentiment",
    label: "Fear & Greed Index",
    desc: "Real-time crypto sentiment, whale alerts and social buzz to gauge market psychology.",
    icon: Gauge,
  },
  {
    to: "/compare",
    label: "Compare Tokens",
    desc: "Put any two cryptocurrencies head-to-head with live data and an AI verdict.",
    icon: GitCompare,
  },
  {
    to: "/polymarket",
    label: "Polymarket Signals",
    desc: "Analyze any Polymarket prediction market — implied odds, risk rating and 24h momentum.",
    icon: Activity,
  },
  {
    to: "/crypto-factory",
    label: "Crypto Factory",
    desc: "Live market intelligence — events, narratives, whale flows and news, scored by impact.",
    icon: Flame,
  },
  {
    to: "/dashboard",
    label: "Market Dashboard",
    desc: "Real-time prices, top gainers, dominance and momentum across the whole market.",
    icon: BarChart3,
  },
];

export default function ToolsHub() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free Crypto Tools",
    url: `${SITE_URL}/tools`,
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.label,
      url: `${SITE_URL}${t.to}`,
    })),
  };

  return (
    <Layout>
      <SEO
        title="Free Crypto Tools – Calculators, Scanners & Analysis | Oracle Bull"
        description="Free crypto tools in one place: profit & DCA calculators, impermanent-loss calculator, token scanner, strength meter, comparison and live Polymarket analysis. No signup."
        canonicalPath="/tools"
      />
      <Helmet>
        
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto">
          {/* Hero */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <Wrench className="w-4 h-4" />
              <span>FREE CRYPTO TOOLKIT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 glow-text">
              Free Crypto Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculators, scanners and live market analysis — every tool runs on real data,
              free and with no signup. Pick a tool to get started.
            </p>
          </header>

          {/* Tools grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map(({ to, label, desc, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="holo-card p-5 group transition-all hover:scale-[1.02] flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-bold font-display text-base mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                  {label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>

          {/* SEO content */}
          <section className="prose prose-neutral dark:prose-invert max-w-none mt-12">
            <h2 className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Free crypto tools, all in one place
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Oracle Bull's free crypto toolkit covers the calculations and research traders run
              every day. Work out exact profit and ROI after fees with the{" "}
              <Link to="/tools/profit-calculator" className="text-primary">profit calculator</Link>,
              plan a dollar-cost-averaging strategy with the{" "}
              <Link to="/tools/dca-calculator" className="text-primary">DCA calculator</Link>, or
              estimate{" "}
              <Link to="/tools/impermanent-loss-calculator" className="text-primary">
                impermanent loss
              </Link>{" "}
              before providing liquidity. Go deeper with the{" "}
              <Link to="/scanner" className="text-primary">token scanner</Link>,{" "}
              <Link to="/crypto-strength-meter" className="text-primary">strength meter</Link> and{" "}
              <Link to="/compare" className="text-primary">comparison tool</Link>. Every tool is
              free, requires no signup, and runs on live market data.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
