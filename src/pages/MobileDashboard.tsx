import { lazy, Suspense, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Zap, Wallet, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/siteConfig";

const MarketSnapshot = lazy(() => import("@/components/home/MarketSnapshot").then(m => ({ default: m.MarketSnapshot })));
const LiveSignals = lazy(() => import("@/components/home/LiveSignals").then(m => ({ default: m.LiveSignals })));
const HomeNews = lazy(() => import("@/components/home/HomeNews").then(m => ({ default: m.HomeNews })));

const TABS = [
  { id: "markets", label: "Markets", icon: TrendingUp },
  { id: "signals", label: "Signals", icon: Zap },
  { id: "picks", label: "AI Picks", icon: Sparkles },
  { id: "wallet", label: "Wallet", icon: Wallet },
] as const;

type TabId = typeof TABS[number]["id"];

function Fallback() {
  return (
    <div className="flex items-center justify-center py-16" role="status">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

export default function MobileDashboard() {
  const [tab, setTab] = useState<TabId>("markets");
  const canonical = `${SITE_URL}/m`;

  return (
    <Layout showTicker={false}>
      <Helmet>
        <title>Mobile Dashboard — Oracle Bull</title>
        <meta name="description" content="Swipeable mobile command center for crypto prices, AI signals, and portfolio insights — optimized for on-the-go trading." />
        <link rel="canonical" href={canonical} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </Helmet>

      <div className="min-h-screen">
        {/* Sticky tab strip — 48px touch targets */}
        <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur border-b">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex-1 min-w-[88px] h-12 flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors",
                    "border-b-2",
                    active ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 py-4 space-y-4" style={{ fontSize: "clamp(14px, 4vw, 16px)" }}>
          {tab === "markets" && (
            <Suspense fallback={<Fallback />}>
              <MarketSnapshot />
              <QuickLinks />
            </Suspense>
          )}

          {tab === "signals" && (
            <Suspense fallback={<Fallback />}>
              <LiveSignals />
            </Suspense>
          )}

          {tab === "picks" && (
            <Suspense fallback={<Fallback />}>
              <AIPicks />
            </Suspense>
          )}

          {tab === "wallet" && (
            <Suspense fallback={<Fallback />}>
              <WalletPanel />
            </Suspense>
          )}

          <Suspense fallback={null}>
            <HomeNews />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}

function QuickLinks() {
  const links = [
    { to: "/predictions", label: "AI Predictions", icon: Sparkles },
    { to: "/crypto-strength-meter", label: "Strength Meter", icon: TrendingUp },
    { to: "/factory", label: "Crypto Factory", icon: Zap },
    { to: "/how-to-read-predictions", label: "How to Read", icon: ArrowRight },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <Link
            key={l.to}
            to={l.to}
            className="h-14 flex items-center gap-3 px-4 rounded-xl border bg-card hover:bg-accent transition-colors font-medium text-sm"
          >
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}

function AIPicks() {
  return (
    <Card className="p-4">
      <h2 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Today's AI Picks</h2>
      <p className="text-sm text-muted-foreground mb-4">Top confidence forecasts across all timeframes.</p>
      <Link to="/predictions" className="inline-flex items-center text-primary text-sm font-semibold">
        View live predictions <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </Card>
  );
}

function WalletPanel() {
  return (
    <Card className="p-4">
      <h2 className="font-bold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Your Wallet</h2>
      <p className="text-sm text-muted-foreground mb-4">Connect a wallet to view balances and holdings.</p>
      <Link to="/my/portfolio" className="inline-flex items-center text-primary text-sm font-semibold">
        Open portfolio <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </Card>
  );
}