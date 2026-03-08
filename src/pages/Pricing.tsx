import { SignalsLayout } from "@/components/signals/SignalsLayout";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X as XIcon, Shield } from "lucide-react";

const tiers = [
  {
    name: "Starter", monthlyPrice: "FREE", annualPrice: "FREE", monthlyLabel: "$0/forever", annualLabel: "$0/forever",
    desc: "Perfect for testing the waters", highlight: false, gold: false, cta: "Start Free", ctaStyle: "outline",
  },
  {
    name: "Pro", monthlyPrice: "$97", annualPrice: "$67", monthlyLabel: "/month", annualLabel: "/month — Billed $804/year",
    desc: "For serious traders ready to profit", badge: "⭐ MOST POPULAR", highlight: true, gold: false, cta: "Start 7-Day Trial →", ctaStyle: "primary",
  },
  {
    name: "VIP", monthlyPrice: "$297", annualPrice: "$207", monthlyLabel: "/month", annualLabel: "/month — Billed $2,484/year",
    desc: "White-glove experience for committed traders", highlight: false, gold: true, cta: "Apply for VIP", ctaStyle: "gold",
  },
];

const featureRows = [
  { feature: "Signals per week", starter: "2-3", pro: "Unlimited", vip: "Unlimited" },
  { feature: "Signal delivery speed", starter: "Standard", pro: "Priority", vip: "First access" },
  { feature: "Telegram access", starter: true, pro: true, vip: true },
  { feature: "Discord access", starter: false, pro: true, vip: true },
  { feature: "Email delivery", starter: true, pro: true, vip: true },
  { feature: "Market analysis reports", starter: false, pro: "Weekly", vip: "Daily" },
  { feature: "Community access", starter: "Read-only", pro: "Full", vip: "Private VIP room" },
  { feature: "Risk management guidance", starter: false, pro: true, vip: true },
  { feature: "Trade reasoning/analysis", starter: "Basic", pro: "Full", vip: "Full + deep dive" },
  { feature: "Performance dashboard", starter: false, pro: true, vip: true },
  { feature: "1-on-1 coaching", starter: false, pro: false, vip: "Weekly calls" },
  { feature: "Portfolio review", starter: false, pro: false, vip: "Monthly" },
  { feature: "Direct analyst access", starter: false, pro: false, vip: true },
  { feature: "Custom position sizing", starter: false, pro: false, vip: true },
  { feature: "Money-back guarantee", starter: "N/A", pro: "7 days", vip: "7 days" },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade anytime from your dashboard." },
  { q: "Is the free plan really free?", a: "Yes, completely. No credit card needed. No hidden fees. Ever." },
  { q: "Do you offer lifetime access?", a: "Yes — contact us for lifetime pricing. It's a one-time payment with permanent access." },
  { q: "What payment methods do you accept?", a: "Visa, Mastercard, Apple Pay, Google Pay via Stripe. We also accept Bitcoin, Ethereum, and USDT." },
  { q: "What happens when I cancel?", a: "You keep access until the end of your billing period. After that, you're moved to the free tier — you never lose your account." },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? <Check size={16} className="text-success mx-auto" /> : <XIcon size={16} className="text-muted-foreground/40 mx-auto" />;
  }
  return <span className="text-foreground text-sm">{value}</span>;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SignalsLayout>
      <Helmet>
        <title>Pricing — OracleBull Crypto Signals Plans</title>
        <meta name="description" content="Simple, transparent pricing for OracleBull crypto signals. Start free, upgrade to Pro or VIP when you're ready. 7-day money-back guarantee." />
      </Helmet>

      <section className="py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Invest In Your Trading Future</h1>
          <p className="text-lg text-muted-foreground mb-8">Choose the plan that matches your ambition. Start free. Upgrade when you're ready.</p>
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1 mb-14">
            <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Annual (Save 31%)</button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {tiers.map((t) => (
              <div key={t.name} className={`relative bg-card border rounded-2xl p-8 text-left ${t.highlight ? "border-primary shadow-lg shadow-primary/10 md:scale-105" : t.gold ? "border-secondary/30" : "border-border"} card-glow`}>
                {t.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full whitespace-nowrap">{t.badge}</span>}
                <h3 className="text-xl font-bold text-foreground mb-1">{t.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{annual ? t.annualPrice : t.monthlyPrice}</span>
                  <span className="text-sm text-muted-foreground">{annual ? t.annualLabel : t.monthlyLabel}</span>
                </div>
                <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${t.ctaStyle === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : t.ctaStyle === "gold" ? "border border-secondary text-secondary hover:bg-secondary/10" : "border border-border text-foreground hover:bg-muted"}`}>
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[1000px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Starter</th>
                  <th className="text-center px-4 py-3 font-medium text-primary">Pro</th>
                  <th className="text-center px-4 py-3 font-medium text-secondary">VIP</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 text-foreground">{r.feature}</td>
                    <td className="px-4 py-3 text-center"><FeatureCell value={r.starter} /></td>
                    <td className="px-4 py-3 text-center"><FeatureCell value={r.pro} /></td>
                    <td className="px-4 py-3 text-center"><FeatureCell value={r.vip} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Money-back */}
      <section className="py-20">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <div className="bg-card border border-border rounded-xl p-8">
            <Shield className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">🛡️ 100% Money-Back Guarantee</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Try any paid plan risk-free for 7 days. If you're not completely satisfied, email us and we'll refund every penny. No questions asked. No hard feelings. We're that confident in our signals.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Pricing FAQ</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="font-medium text-foreground text-sm">{f.q}</span>
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Still not sure? Start free and see for yourself.</h2>
        <Link to="/pricing" className="inline-flex px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-lg">Start Free →</Link>
      </section>
    </SignalsLayout>
  );
}
