import { Brain, Shield, Zap, BarChart3, HelpCircle, Heart, Users, Clock } from "lucide-react";

// "Why traders use us" — honest value-prop content (replaces fabricated
// testimonials and vanity stat bars that previously lived here).
export function SEOContentBlock() {
  return (
    <section className="py-12 md:py-16 border-b border-border/30" aria-labelledby="seo-content-heading">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase mb-4">
            Why Oracle Bull
          </span>
          <h2 id="seo-content-heading" className="text-[clamp(1.25rem,4vw,1.875rem)] font-display font-bold">
            Institutional-Grade Crypto Intelligence, <span className="glow-text">Free for Everyone</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl mx-auto text-sm md:text-base">
            Oracle Bull combines AI models with real-time blockchain data to deliver cryptocurrency
            analysis for researchers, developers and traders worldwide — completely free, no signup required.
          </p>
        </header>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Our AI models analyze price action, market cycles and sentiment to generate
              daily, weekly and monthly forecasts for Bitcoin, Ethereum and 1,000+ altcoins —
              each with a confidence score, not a guarantee.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Real-Time Data</h3>
            <p className="text-muted-foreground text-sm">
              Live price feeds refresh continuously. Track market movements as they happen with our
              real-time ticker, market snapshot and live gainers &amp; losers.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Multi-Chain Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Blockchain analytics across Ethereum, Solana, Base, Arbitrum, Polygon, BNB Chain,
              Optimism and Avalanche. Monitor DeFi TVL, gas, volume and ecosystem health in one place.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Whale Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Follow smart-money movements with our whale activity radar. See when large wallets
              accumulate or distribute tokens, helping you spot trends earlier.
            </p>
          </article>
        </div>

        {/* Why Free Explainer */}
        <div className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6 md:p-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl mb-2 flex items-center gap-2">
                Why Is Oracle Bull Free?
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                We believe institutional-grade market intelligence should be accessible to everyone — not just hedge funds
                and professional traders. Oracle Bull is sustained through non-intrusive advertising partnerships,
                keeping all core analytics tools, AI predictions and educational content 100% free for retail users.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/30">
                  <Shield className="w-3 h-3 text-success" />
                  No hidden fees
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/30">
                  <Users className="w-3 h-3 text-primary" />
                  No signup required
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/30">
                  <Clock className="w-3 h-3 text-warning" />
                  Unlimited access
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
