import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    stars: 5,
    quote: "I was skeptical — I'd been burned by 3 other signal groups before. But OracleBull's transparency convinced me to try. My $2,000 account is now worth $23,000 in 6 months. The signals are accurate, timely, and always come with clear reasoning.",
    name: "Marcus T.",
    role: "Software Engineer",
    since: "Jan 2024",
    profit: "+$21,000",
    initials: "MT",
  },
  {
    stars: 5,
    quote: "As a complete beginner, I was terrified of losing money. OracleBull made it so simple — just copy the signal, set the stop-loss, done. I've learned more in 3 months here than in a year of YouTube tutorials.",
    name: "Sarah K.",
    role: "Nurse",
    since: "Mar 2024",
    profit: "+$8,400",
    initials: "SK",
  },
  {
    stars: 5,
    quote: "The risk management alone is worth the subscription. Every other group just says 'buy here' with no stop-loss. OracleBull protects your capital first. That philosophy changed my entire approach to trading.",
    name: "James L.",
    role: "Business Owner",
    since: "Nov 2023",
    profit: "+$34,200",
    initials: "JL",
  },
  {
    stars: 5,
    quote: "I tried the free tier for 2 weeks, saw 6 out of 7 signals hit profit, and upgraded immediately. Best investment I've made this year. The VIP group is incredible.",
    name: "David R.",
    role: "Full-time Trader",
    since: "Feb 2024",
    profit: "+$52,000",
    initials: "DR",
  },
  {
    stars: 5,
    quote: "What sets OracleBull apart is the education. They don't just tell you WHAT to trade — they explain WHY. I'm now starting to find my own setups alongside their signals.",
    name: "Priya M.",
    role: "Student",
    since: "Apr 2024",
    profit: "+$5,200",
    initials: "PM",
  },
  {
    stars: 5,
    quote: "I manage a $200K portfolio and use OracleBull for short-term swing trades. Their analysis is institutional quality at a retail price. Highly recommend for serious traders.",
    name: "Michael W.",
    role: "Portfolio Manager",
    since: "Sep 2023",
    profit: "+$89,000",
    initials: "MW",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const visible = typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1;

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  const displayed = [];
  for (let i = 0; i < visible; i++) {
    displayed.push(testimonials[(current + i) % testimonials.length]);
  }

  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Don't Take Our Word For It</h2>
          <p className="text-muted-foreground">Here's what our members say</p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 gap-6">
            {displayed.map((t, i) => (
              <div key={`${current}-${i}`} className="bg-card border border-border rounded-xl p-6 animate-fade-in">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={16} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} • Member since {t.since}</p>
                  </div>
                  <span className="ml-auto text-sm font-mono font-bold text-success">{t.profit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-muted-foreground">{current + 1} / {testimonials.length}</span>
            <button onClick={next} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">Rated 4.8/5 from 2,300+ reviews</p>
      </div>
    </section>
  );
}
