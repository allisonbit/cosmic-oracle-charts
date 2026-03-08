import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  { q: "How do I receive signals?", a: "Signals are delivered instantly via Telegram, Discord, and email. Most members prefer Telegram for the fastest notifications. Setup takes about 2 minutes after signing up." },
  { q: "How much money do I need to start?", a: "You can start with as little as $100-$500. Our signals use percentage-based targets that work with any account size. We recommend $500+ for meaningful results." },
  { q: "Do I need trading experience?", a: "Not at all. Every signal includes exact entry, stop-loss, and take-profit levels. We also provide beginner tutorials and video guides showing you how to place trades step by step." },
  { q: "What's your win rate?", a: "Our overall verified win rate is 85.4%. You can view our complete track record — including losses — on our Track Record page. We believe in full transparency." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no lock-in periods, no cancellation fees. Cancel from your dashboard anytime and you won't be charged again." },
];

export function FAQPreview() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-foreground">{faq.q}</span>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform shrink-0 ml-2 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center mt-8">
          <Link to="/faq" className="text-primary hover:underline text-sm">Have more questions? Visit our full FAQ →</Link>
        </p>
      </div>
    </section>
  );
}
