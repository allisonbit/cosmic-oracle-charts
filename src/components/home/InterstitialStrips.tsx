import { Link } from "react-router-dom";
import { Shield, CheckCircle, Users, BarChart3, Heart, Zap, ArrowRight } from "lucide-react";

// ── Thin editorial interstitials ───────────────────────────────────────────
// The marketing copy that used to crowd the hero, broken into slim full-width
// strips scattered between the live-content sections. No cards — just rules,
// inline icons and a single line of copy each. They punctuate the newsroom
// flow without stealing the top of the page.

// Trust signals — one quiet line.
export function TrustStrip() {
  const items = [
    { icon: Shield, label: "No signup needed" },
    { icon: CheckCircle, label: "Free forever" },
    { icon: Users, label: "1,000+ tokens tracked" },
    { icon: BarChart3, label: "8 blockchains" },
  ];
  return (
    <section className="border-y border-border/30" aria-label="Why Oracle Bull">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-center sm:justify-between gap-x-8 gap-y-2">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Value proposition — the old hero paragraph, now a mid-page pull quote.
export function ValueStrip() {
  return (
    <section className="border-y border-border/30" aria-label="What Oracle Bull does">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <p className="max-w-4xl text-lg md:text-2xl font-display font-semibold leading-snug text-foreground">
          Real-time price predictions, on-chain intelligence, whale tracking and sentiment analysis for{" "}
          <span className="text-gradient-cosmic">Bitcoin, Ethereum, Solana and 1,000+ tokens</span>{" "}
          across 8 blockchains — <span className="text-primary">completely free, no signup.</span>
        </p>
      </div>
    </section>
  );
}

// Why-free — an honest one-liner with a link.
export function WhyFreeStrip() {
  return (
    <section className="border-y border-border/30" aria-label="Why it's free">
      <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Heart className="w-4 h-4 text-primary" />
          <span className="section-label">Why it's free</span>
        </div>
        <p className="text-sm text-muted-foreground flex-1">
          We believe market intelligence shouldn't be gated behind paywalls or logins. Oracle Bull stays free so anyone can make informed decisions.
        </p>
        <Link to="/about" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">
          Learn more <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}

// Speed/coverage claim — one punchy line, breaks up the lower page.
export function CoverageStrip() {
  return (
    <section className="border-y border-border/30" aria-label="Coverage">
      <div className="container mx-auto px-4 py-5 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Updated in real time</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Prices, signals and sentiment refresh continuously — daily predictions every 5 minutes.
        </span>
      </div>
    </section>
  );
}
