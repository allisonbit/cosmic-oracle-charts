import { Brain, Shield, Zap, BarChart3, HelpCircle, Heart, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    color: "text-primary",
    title: "AI-Powered Analysis",
    description:
      "Our AI models analyze price action, market cycles and sentiment to generate daily, weekly and monthly forecasts for Bitcoin, Ethereum and 1,000+ altcoins — each with a confidence score, not a guarantee.",
  },
  {
    icon: Zap,
    color: "text-secondary",
    title: "Real-Time Data",
    description:
      "Live price feeds refresh continuously. Track market movements as they happen with our real-time ticker, market snapshot and live gainers & losers.",
  },
  {
    icon: BarChart3,
    color: "text-success",
    title: "Multi-Chain Analytics",
    description:
      "Blockchain analytics across Ethereum, Solana, Base, Arbitrum, Polygon, BNB Chain, Optimism and Avalanche. Monitor DeFi TVL, gas, volume and ecosystem health in one place.",
  },
  {
    icon: Shield,
    color: "text-warning",
    title: "Whale Tracking",
    description:
      "Follow smart-money movements with our whale activity radar. See when large wallets accumulate or distribute tokens, helping you spot trends earlier.",
  },
];

const badges = [
  { icon: Shield, label: "No hidden fees", color: "text-success" },
  { icon: Users, label: "No signup required", color: "text-primary" },
  { icon: Clock, label: "Unlimited access", color: "text-warning" },
];

export function SEOContentBlock() {
  return (
    <section className="py-12 md:py-16 border-b border-border/30" aria-labelledby="seo-content-heading">
      <div className="container mx-auto px-4">
        <div className="section-header mb-2">
          <span className="section-label">Why Oracle Bull</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <h2 id="seo-content-heading" className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold leading-tight max-w-lg">
            Institutional-Grade Crypto Intelligence,{" "}
            <span className="glow-text">Free for Everyone</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm">
            Oracle Bull combines AI models with real-time blockchain data to deliver cryptocurrency
            analysis for researchers, developers and traders worldwide — completely free.
          </p>
        </div>

        {/* Core features — editorial 2-column list */}
        <div className="grid md:grid-cols-2 gap-0 mb-0">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="border-t border-border/30 pt-6 pb-6 md:pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${f.color} flex-shrink-0`} />
                  <h3 className="font-display font-bold text-base md:text-lg">{f.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </article>
            );
          })}
        </div>

        {/* Why Free — editorial, no box */}
        <div className="border-t border-border/30 pt-6 mt-0">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-base md:text-lg mb-2 flex items-center gap-2">
                Why Is Oracle Bull Free?
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                We believe institutional-grade market intelligence should be accessible to everyone — not just hedge funds
                and professional traders. Oracle Bull is sustained through non-intrusive advertising partnerships,
                keeping all core analytics tools, AI predictions and educational content 100% free for retail users.
              </p>
              <div className="flex flex-wrap gap-5">
                {badges.map(({ icon: BadgeIcon, label, color }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <BadgeIcon className={`w-3 h-3 ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
