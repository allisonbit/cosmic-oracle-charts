import { SignalsLayout } from "@/components/signals/SignalsLayout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, X as XIcon } from "lucide-react";
import { motion } from "framer-motion";

const signalParts = [
  { label: "Trading Pair", desc: "We cover BTC, ETH, SOL, and 20+ major altcoins" },
  { label: "Direction", desc: "Long (buy) or Short (sell) — we trade both directions" },
  { label: "Entry Zone", desc: "A price range to enter, not a single price — so you have time" },
  { label: "Stop-Loss", desc: "Your safety net. If the trade goes wrong, you exit here automatically" },
  { label: "Take-Profit Targets", desc: "Usually 3 targets. Most members close 33% at each level" },
  { label: "Risk Level", desc: "Low, Medium, or High — so you can size your position accordingly" },
  { label: "Analysis", desc: "Brief explanation of WHY we're taking this trade" },
];

const coins = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "LINK", "DOT", "MATIC", "ATOM", "UNI", "AAVE"];

const comparison = [
  { typical: "50+ random signals daily (spam)", oracle: "4-6 carefully selected high-probability signals" },
  { typical: "No stop-losses provided", oracle: "Every signal includes a stop-loss" },
  { typical: "No explanation given", oracle: "Full analysis with every signal" },
  { typical: "Hide their losses", oracle: "Complete public track record (wins AND losses)" },
  { typical: "Ghost after a bad week", oracle: "Post-trade analysis on every trade" },
  { typical: "Unverified results", oracle: "Independently verified performance" },
];

export default function Services() {
  return (
    <SignalsLayout>
      <Helmet>
        <title>Our Services — OracleBull Crypto Trading Signals</title>
        <meta name="description" content="See exactly what you get with OracleBull crypto signals. Detailed entry/exit levels, risk management, and expert analysis delivered instantly." />
      </Helmet>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">What You Get With OracleBull</h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">Everything you need to trade crypto profitably — without spending hours analyzing charts</p>
        </div>
      </section>

      {/* Signal Anatomy */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-14">Anatomy of an OracleBull Signal</h2>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Signal card */}
            <div className="bg-card border border-primary/20 rounded-2xl p-6 card-glow">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🐂</span>
                <span className="font-bold text-foreground">ORACLEBULL SIGNAL</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Pair:</span> <span className="text-foreground font-semibold">ETH/USDT</span></p>
                <p><span className="text-muted-foreground">Direction:</span> <span className="text-success">🟢 LONG</span></p>
                <p><span className="text-muted-foreground">Entry:</span> <span className="font-mono text-foreground">$3,420 — $3,480</span></p>
                <p><span className="text-muted-foreground">Stop-Loss:</span> <span className="font-mono text-destructive">$3,280 (-4.2%)</span></p>
                <p><span className="text-muted-foreground">TP1:</span> <span className="font-mono text-success">$3,650 (+5.3%)</span></p>
                <p><span className="text-muted-foreground">TP2:</span> <span className="font-mono text-success">$3,800 (+9.7%)</span></p>
                <p><span className="text-muted-foreground">TP3:</span> <span className="font-mono text-success">$3,950 (+14.1%)</span></p>
                <p><span className="text-muted-foreground">Risk:</span> <span className="text-secondary">Medium</span></p>
                <p className="text-muted-foreground mt-2">📝 Clean breakout above $3,400 resistance with volume confirmation.</p>
              </div>
            </div>

            {/* Explanations */}
            <div className="space-y-4">
              {signalParts.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{p.label}</h4>
                    <p className="text-muted-foreground text-sm">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Methods */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-14">Delivery Methods</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Telegram", icon: "✈️", desc: "Primary channel — instant push notifications the second a signal drops." },
              { name: "Discord", icon: "🎮", desc: "Full community access with channels for signals, discussion, and education." },
              { name: "Email", icon: "📧", desc: "Backup delivery — every signal also arrives in your inbox." },
            ].map((m, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-center card-glow">
                <span className="text-4xl block mb-4">{m.icon}</span>
                <h3 className="text-lg font-bold text-foreground mb-2">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Covered */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Markets We Cover</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {coins.map((c) => (
              <span key={c} className="px-4 py-2 bg-muted border border-border rounded-lg text-sm font-semibold text-foreground">{c}</span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">We focus exclusively on high-liquidity markets to ensure you can enter and exit trades smoothly.</p>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20">
        <div className="max-w-[900px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-14">Our Edge</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-border">
              <div className="px-4 py-3 font-semibold text-destructive text-sm">Typical Signal Groups</div>
              <div className="px-4 py-3 font-semibold text-success text-sm">OracleBull</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className="grid grid-cols-2 border-b border-border/50 last:border-0">
                <div className="px-4 py-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <XIcon size={14} className="text-destructive shrink-0 mt-1" /> {row.typical}
                </div>
                <div className="px-4 py-3 flex items-start gap-2 text-sm text-foreground">
                  <Check size={14} className="text-success shrink-0 mt-1" /> {row.oracle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to receive your first signal?</h2>
        <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-lg">
          Start Free Trial →
        </Link>
      </section>
    </SignalsLayout>
  );
}
