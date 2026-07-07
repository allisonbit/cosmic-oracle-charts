import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Calculator, TrendingDown, Droplets, Gauge, Search, Zap, Activity,
  GitCompare, Flame, BarChart3, ArrowRight, Newspaper, Brain,
  TrendingUp, Target, Shield, ChevronRight,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";

const TOOLS = [
  {
    to: "/tools/profit-calculator",
    label: "Crypto Profit Calculator",
    desc: "Calculate exact trading profit, ROI and break-even after exchange fees on both sides.",
    icon: Calculator,
    tag: "Calculator",
  },
  {
    to: "/tools/dca-calculator",
    label: "DCA Calculator",
    desc: "Model a dollar-cost-averaging plan and project your average entry and returns over time.",
    icon: TrendingDown,
    tag: "Calculator",
  },
  {
    to: "/tools/impermanent-loss-calculator",
    label: "Impermanent Loss Calculator",
    desc: "Estimate impermanent loss for an AMM liquidity pool before you provide liquidity.",
    icon: Droplets,
    tag: "DeFi",
  },
  {
    to: "/scanner",
    label: "Token Scanner",
    desc: "Scan thousands of tokens across every chain for new listings, volume spikes and risk signals.",
    icon: Search,
    tag: "Research",
  },
  {
    to: "/crypto-strength-meter",
    label: "Crypto Strength Meter",
    desc: "Live 0-100 strength rankings for Bitcoin, Ethereum, Solana and 100+ assets updated every minute.",
    icon: Zap,
    tag: "Analysis",
  },
  {
    to: "/sentiment",
    label: "Fear & Greed Index",
    desc: "Real-time crypto sentiment, whale alerts and social buzz to gauge market psychology.",
    icon: Gauge,
    tag: "Sentiment",
  },
  {
    to: "/compare",
    label: "Compare Tokens",
    desc: "Put any two cryptocurrencies head-to-head with live data and an AI-generated verdict.",
    icon: GitCompare,
    tag: "Research",
  },
  {
    to: "/polymarket",
    label: "Polymarket Signals",
    desc: "Analyze any Polymarket prediction market — implied odds, risk rating and 24h momentum.",
    icon: Activity,
    tag: "Markets",
  },
  {
    to: "/crypto-factory",
    label: "Crypto Factory",
    desc: "Live market intelligence — events, narratives, whale flows and news, scored by impact.",
    icon: Flame,
    tag: "Intelligence",
  },
  {
    to: "/dashboard",
    label: "Market Dashboard",
    desc: "Real-time prices, top gainers, dominance and momentum across the whole market.",
    icon: BarChart3,
    tag: "Markets",
  },
];

const QUICK_LINKS = [
  { to: "/predictions", label: "AI Price Predictions", icon: Brain },
  { to: "/news", label: "Crypto News", icon: Newspaper },
  { to: "/explorer", label: "Blockchain Explorer", icon: Search },
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
        title="Free Crypto Tools -- Calculators, Scanners & Analysis | Oracle Bull"
        description="Free crypto tools in one place: profit & DCA calculators, impermanent-loss calculator, token scanner, strength meter, comparison and live Polymarket analysis. No signup."
        canonicalPath="/tools"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-6">

        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Free Tools</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">· No signup required</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tighter leading-none">
                Crypto Toolkit
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Calculators, scanners and live market analysis — every tool runs on real data. Pick one to get started.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {TOOLS.length} tools available
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10">

          {/* Main tool list */}
          <div>
            {/* Featured tools — top 3 large */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {TOOLS.slice(0, 3).map(({ to, label, desc, icon: Icon, tag }) => (
                <Link key={to} to={to}
                  className="group border-b border-r border-border p-5 hover:bg-muted/30 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tag}</span>
                  </div>
                  <h2 className="font-bold font-display text-base sm:text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>

            {/* Remaining tools — editorial rows */}
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-2">
                All Tools
              </h2>
              {TOOLS.slice(3).map(({ to, label, desc, icon: Icon, tag }) => (
                <Link key={to} to={to}
                  className="group flex items-start gap-4 py-4 border-b border-border/50 hover:bg-muted/20 transition-all px-1">
                  <div className="w-9 h-9 flex items-center justify-center bg-primary/10 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold font-display text-sm sm:text-base group-hover:text-primary transition-colors">
                        {label}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 border border-border/50 px-1.5 py-px hidden sm:inline">
                        {tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-1">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-2 shrink-0" />
                </Link>
              ))}
            </div>

            {/* How to use section */}
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
                How to use these tools
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-primary font-bold text-xs">01</span>
                    <h3 className="font-bold text-sm">Pick a tool</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Choose from calculators, scanners, or live analysis tools above. All are free with no account needed.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-primary font-bold text-xs">02</span>
                    <h3 className="font-bold text-sm">Enter your data</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Input your numbers — buy/sell prices, investment amount, token pairs — and get instant results from live market data.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-primary font-bold text-xs">03</span>
                    <h3 className="font-bold text-sm">Make better decisions</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use the results to plan entries, size positions, evaluate risk and compare opportunities before committing capital.
                  </p>
                </div>
              </div>
            </div>

            {/* SEO content */}
            <div className="mt-10 border-t border-border/30 pt-8">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Oracle Bull's free crypto toolkit covers the calculations and research traders run
                every day. Work out exact profit and ROI after fees with the{" "}
                <Link to="/tools/profit-calculator" className="text-primary hover:underline">profit calculator</Link>,
                plan a dollar-cost-averaging strategy with the{" "}
                <Link to="/tools/dca-calculator" className="text-primary hover:underline">DCA calculator</Link>, or
                estimate{" "}
                <Link to="/tools/impermanent-loss-calculator" className="text-primary hover:underline">
                  impermanent loss
                </Link>{" "}
                before providing liquidity. Go deeper with the{" "}
                <Link to="/scanner" className="text-primary hover:underline">token scanner</Link>,{" "}
                <Link to="/crypto-strength-meter" className="text-primary hover:underline">strength meter</Link> and{" "}
                <Link to="/compare" className="text-primary hover:underline">comparison tool</Link>. Every tool is
                free, requires no signup, and runs on live market data.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-16 space-y-8">

              {/* Quick stats */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-2">
                  Platform
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tools</span>
                    <span className="font-bold">{TOOLS.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-bold text-success">Live</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Signup</span>
                    <span className="font-bold">Not required</span>
                  </div>
                </div>
              </div>

              {/* Also on Oracle Bull */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-2">
                  Also on Oracle Bull
                </h3>
                <div>
                  {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to}
                      className="flex items-center gap-3 py-2.5 border-b border-border/30 text-sm font-medium hover:text-primary transition-colors group">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-border pt-6">
                <h3 className="font-bold font-display text-sm mb-2">Want AI predictions?</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Get daily AI-powered price predictions for 200+ cryptocurrencies with entry zones, stop losses and take profit targets.
                </p>
                <Link to="/predictions"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all">
                  <TrendingUp className="w-3.5 h-3.5" /> View Predictions
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
