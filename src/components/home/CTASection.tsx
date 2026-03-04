import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Brain, Zap, ArrowRight, BarChart3, Search, Activity, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "dashboard",
    icon: TrendingUp,
    title: "Live Dashboard",
    buttonText: "Open Dashboard",
    link: "/dashboard",
    accent: "text-success",
    accentBg: "bg-success/15 border-success/30",
    description: "Real-time charts, price alerts, and market trends — all updating live every 15 seconds.",
    features: [
      { icon: Activity, text: "24/7 live price feeds" },
      { icon: BarChart3, text: "Institutional-grade charts" },
      { icon: Shield, text: "Whale activity alerts" },
    ],
    preview: [
      { label: "BTC", value: "$97,420", change: "+1.2%" },
      { label: "ETH", value: "$3,410", change: "+0.8%" },
      { label: "SOL", value: "$192", change: "+2.1%" },
    ],
  },
  {
    id: "portfolio",
    icon: Wallet,
    title: "Track My Portfolio",
    buttonText: "Start Tracking",
    link: "/portfolio",
    accent: "text-primary",
    accentBg: "bg-primary/15 border-primary/30",
    description: "Add your holdings and watch your portfolio value, risk score, and allocation update in real-time.",
    features: [
      { icon: Wallet, text: "Multi-wallet support" },
      { icon: Shield, text: "Risk classification" },
      { icon: BarChart3, text: "Performance history" },
    ],
    preview: [
      { label: "Holdings", value: "12 tokens", change: "" },
      { label: "Risk", value: "Medium", change: "" },
      { label: "24h P&L", value: "+$340", change: "+2.4%" },
    ],
  },
  {
    id: "predictions",
    icon: Brain,
    title: "AI Predictions",
    buttonText: "View Predictions",
    link: "/chain/ethereum",
    accent: "text-secondary",
    accentBg: "bg-secondary/15 border-secondary/30",
    description: "AI-powered forecasts for 500+ tokens across multiple timeframes with confidence scoring.",
    features: [
      { icon: Brain, text: "Multi-model AI ensemble" },
      { icon: Activity, text: "1h to 30d timeframes" },
      { icon: TrendingUp, text: "Signal strength meter" },
    ],
    preview: [
      { label: "ETH 7d", value: "Bullish", change: "82% conf" },
      { label: "SOL 24h", value: "Neutral", change: "61% conf" },
      { label: "BTC 30d", value: "Bullish", change: "74% conf" },
    ],
  },
  {
    id: "explorer",
    icon: Search,
    title: "Token Explorer",
    buttonText: "Explore Tokens",
    link: "/explorer",
    accent: "text-warning",
    accentBg: "bg-warning/15 border-warning/30",
    description: "Search any token across 8 chains for live prices, charts, liquidity, and on-chain analytics.",
    features: [
      { icon: Search, text: "18,000+ tokens" },
      { icon: Zap, text: "Cross-chain search" },
      { icon: Activity, text: "Live liquidity data" },
    ],
    preview: [
      { label: "Chains", value: "8", change: "" },
      { label: "Tokens", value: "18,000+", change: "" },
      { label: "Updates", value: "Real-time", change: "" },
    ],
  },
];

export function CTASection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const active = tabs.find(t => t.id === activeTab)!;
  const ActiveIcon = active.icon;

  return (
    <section className="py-16 md:py-24 cosmic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-display font-bold">
            START <span className="glow-text">EXPLORING</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm md:text-base">
            Free, open-access tools to navigate the crypto universe. Pick a tool below to preview.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-xl bg-muted/30 border border-border/50">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-display transition-all",
                    activeTab === tab.id
                      ? `bg-background shadow-md ${tab.accent} font-bold`
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{tab.title}</span>
                  <span className="sm:hidden">{tab.id === "predictions" ? "AI" : tab.title.split(" ").pop()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active tab content */}
        <div className="max-w-4xl mx-auto">
          <div className="holo-card overflow-hidden animate-fade-in" key={active.id}>
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: info */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 border", active.accentBg)}>
                  <ActiveIcon className={cn("w-6 h-6", active.accent)} />
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl mb-3">{active.title}</h3>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{active.description}</p>

                <div className="space-y-2 mb-6">
                  {active.features.map((f, i) => {
                    const FIcon = f.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <FIcon className={cn("w-3.5 h-3.5", active.accent)} />
                        <span className="text-foreground/80">{f.text}</span>
                      </div>
                    );
                  })}
                </div>

                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={active.link} className="inline-flex items-center gap-2">
                    {active.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* Right: preview */}
              <div className="bg-muted/20 border-t md:border-t-0 md:border-l border-border/30 p-6 md:p-8 flex flex-col justify-center">
                <p className="text-[10px] uppercase text-muted-foreground font-display tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Live Preview
                </p>
                <div className="space-y-3">
                  {active.preview.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border/30 animate-fade-in"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <span className="text-xs font-display text-muted-foreground">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold">{row.value}</span>
                        {row.change && (
                          <span className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded",
                            row.change.startsWith("+") ? "bg-success/15 text-success" : "bg-muted/30 text-muted-foreground"
                          )}>
                            {row.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini sparkline placeholder */}
                <div className="mt-4 h-10 rounded-lg bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 flex items-end px-2 gap-[2px]">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-primary/40"
                      style={{ height: `${20 + Math.sin(i * 0.8) * 15 + Math.random() * 10}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
