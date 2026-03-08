import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X as XIcon } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "FREE",
    annualPrice: "FREE",
    monthlyLabel: "$0/forever",
    annualLabel: "$0/forever",
    desc: "Perfect for testing the waters",
    features: [
      { text: "2-3 signals per week", included: true },
      { text: "Basic market updates", included: true },
      { text: "Community access (read-only)", included: true },
      { text: "Email delivery", included: true },
      { text: "Educational resources", included: true },
      { text: "Priority signals", included: false },
      { text: "Full community access", included: false },
      { text: "Risk management guidance", included: false },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    highlight: false,
    gold: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$97",
    annualPrice: "$67",
    monthlyLabel: "/month",
    annualLabel: "/month — Billed $804/year",
    desc: "For serious traders ready to profit",
    badge: "⭐ MOST POPULAR",
    features: [
      { text: "Unlimited signals (all pairs)", included: true },
      { text: "Priority alerts (before free members)", included: true },
      { text: "Full community access", included: true },
      { text: "Telegram + Discord + Email delivery", included: true },
      { text: "Risk management guidance", included: true },
      { text: "Weekly market analysis reports", included: true },
      { text: "Trade reasoning with every signal", included: true },
      { text: "Performance dashboard access", included: true },
    ],
    cta: "Start 7-Day Trial →",
    variant: "primary" as const,
    highlight: true,
    gold: false,
  },
  {
    name: "VIP",
    monthlyPrice: "$297",
    annualPrice: "$207",
    monthlyLabel: "/month",
    annualLabel: "/month — Billed $2,484/year",
    desc: "White-glove experience for committed traders",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "1-on-1 coaching calls (weekly)", included: true },
      { text: "Personal portfolio review (monthly)", included: true },
      { text: "Private VIP group (max 50 members)", included: true },
      { text: "Early access to every signal", included: true },
      { text: "Direct line to head analyst", included: true },
      { text: "Custom signals for your portfolio size", included: true },
      { text: "Exclusive VIP market reports", included: true },
    ],
    cta: "Apply for VIP",
    variant: "gold" as const,
    highlight: false,
    gold: true,
  },
];

export function PricingPreview() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>

          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Annual (Save 31%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-6 sm:p-8 ${
                plan.highlight ? "border-primary shadow-lg shadow-primary/10 scale-105" : plan.gold ? "border-secondary/30 gold-glow" : "border-border card-glow"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{annual ? plan.annualPrice : plan.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">{annual ? plan.annualLabel : plan.monthlyLabel}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <XIcon size={16} className="text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/40"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : plan.gold
                    ? "border border-secondary text-secondary hover:bg-secondary/10"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">💳 7-day money-back guarantee on all paid plans • Cancel anytime • No contracts</p>
          <p className="text-xs text-muted-foreground">🔒 Payments secured by Stripe. We also accept crypto.</p>
        </div>
      </div>
    </section>
  );
}
