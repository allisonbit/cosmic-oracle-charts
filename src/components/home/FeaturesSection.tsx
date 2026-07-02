import {
  Brain, Globe, Radio, Shield, ArrowRight,
  TrendingUp, Zap, Target, BookOpen, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    to: "/predictions",
    icon: Target,
    label: "AI Predictions",
    title: "AI-Powered Price Predictions",
    description:
      "Our AI models analyze technical indicators, on-chain flows, and social sentiment to forecast price movements — with a transparent confidence score on every prediction.",
    accent: "text-primary",
    cta: "View predictions",
    detail: (
      <div className="flex gap-4 mt-4 text-sm">
        <div>
          <div className="section-label mb-0.5">BTC Confidence</div>
          <div className="font-bold text-success flex items-center gap-1">89% Buy <TrendingUp className="w-3 h-3" /></div>
        </div>
        <div>
          <div className="section-label mb-0.5">ETH Target</div>
          <div className="font-bold">$3,850</div>
        </div>
      </div>
    ),
  },
  {
    to: "/dashboard",
    icon: Activity,
    label: "Live Data",
    title: "Live Market Dashboard",
    description:
      "Track global momentum, sector performance, and volume leaders in real-time. Zero delay, always current.",
    accent: "text-secondary",
    cta: "Open dashboard",
    detail: null,
  },
  {
    to: "/explorer",
    icon: Globe,
    label: "Multi-Chain",
    title: "Multi-Chain Token Explorer",
    description:
      "Search any token across 8 blockchains. Instantly view liquidity depth, holder distribution, and risk scores.",
    accent: "text-chart-2",
    cta: "Explore tokens",
    detail: (
      <div className="flex gap-2 mt-4">
        {["ETH", "SOL", "BASE", "ARB", "BNB"].map((c) => (
          <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded border border-border/50 text-muted-foreground">
            {c}
          </span>
        ))}
      </div>
    ),
  },
  {
    to: "/scanner",
    icon: Shield,
    label: "Wallet Scanner",
    title: "AI Wallet Risk Scanner",
    description:
      "Analyze any address for holdings, PnL, and AI risk assessment. Spot risky tokens before you ape in.",
    accent: "text-warning",
    cta: "Scan a wallet",
    detail: null,
  },
  {
    to: "/sentiment",
    icon: Radio,
    label: "Sentiment",
    title: "Social Sentiment Radar",
    description:
      "Track fear/greed and social buzz before it hits the charts. Know the crowd's conviction before the move.",
    accent: "text-chart-4",
    cta: "Check sentiment",
    detail: null,
  },
  {
    to: "/learn",
    icon: BookOpen,
    label: "Learn",
    title: "Crypto Education Hub",
    description:
      "Master crypto markets with comprehensive guides, glossaries, and strategy breakdowns for every level.",
    accent: "text-foreground",
    cta: "Start learning",
    detail: null,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <div className="section-header mb-2">
          <span className="section-label flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" />
            Institutional Toolset
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h2 id="features-heading" className="text-[clamp(1.75rem,4vw,3rem)] font-display font-extrabold leading-tight tracking-tight max-w-lg">
            Trade with the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Oracle's Vision
            </span>
          </h2>
          <p className="text-muted-foreground text-base max-w-sm">
            Everything you need to analyze, predict, and conquer the crypto markets in one place.
          </p>
        </div>

        {/* Editorial feature list */}
        <div className="max-w-4xl">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group editorial-row items-start gap-6 py-6"
              >
                {/* Index */}
                <span className="text-xs font-mono text-muted-foreground/40 w-5 flex-shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon + label */}
                <div className="flex-shrink-0 pt-0.5">
                  <Icon className={`w-5 h-5 ${f.accent} opacity-70 group-hover:opacity-100 transition-opacity`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="section-label mb-1">{f.label}</div>
                  <h3 className="font-display text-lg font-bold mb-1.5 group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  {f.detail}
                </div>

                {/* CTA arrow */}
                <div className={`flex items-center gap-1 text-xs font-semibold ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5`}>
                  {f.cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <Button asChild variant="cosmic" size="lg" className="rounded-full px-8 text-base">
            <Link to="/dashboard">
              Start Exploring for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
