import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Alex R.",
    role: "Day Trader",
    location: "New York, USA",
    rating: 5,
    text: "Oracle Bull's AI predictions have completely changed my entry strategy. The confidence scores are genuinely accurate — I've improved my win rate by nearly 20% in 3 months.",
    avatar: "AR",
    color: "bg-primary",
  },
  {
    name: "Sarah M.",
    role: "Crypto Investor",
    location: "London, UK",
    rating: 5,
    text: "The whale tracking feature is insane. I saw a massive accumulation signal on SOL two days before it pumped 40%. This tool pays for itself — and it's free!",
    avatar: "SM",
    color: "bg-secondary",
  },
  {
    name: "James T.",
    role: "Portfolio Manager",
    location: "Singapore",
    rating: 5,
    text: "I use Oracle Bull every morning alongside my Bloomberg terminal. The on-chain intelligence and multi-chain coverage is genuinely institutional quality. Remarkable for a free platform.",
    avatar: "JT",
    color: "bg-success",
  },
  {
    name: "Maria L.",
    role: "Crypto Analyst",
    location: "Berlin, Germany",
    rating: 5,
    text: "The Bento dashboard and real-time sentiment data are my go-to. The AI fear/greed integration actually caught the March 2024 crash signal 18 hours early.",
    avatar: "ML",
    color: "bg-warning",
  },
  {
    name: "David K.",
    role: "DeFi Researcher",
    location: "Toronto, Canada",
    rating: 5,
    text: "As a DeFi researcher, the multi-chain token explorer is my #1 tool. Finding contract details, liquidity depth and risk scores in one place saves me hours daily.",
    avatar: "DK",
    color: "bg-chart-2",
  },
  {
    name: "Priya S.",
    role: "Retail Investor",
    location: "Mumbai, India",
    rating: 5,
    text: "I'm a beginner but Oracle Bull makes it so easy. The Learn Hub explained DCA and technical analysis in a way I finally understood. Started investing with much more confidence!",
    avatar: "PS",
    color: "bg-chart-4",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("w-4 h-4", i < rating ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 overflow-hidden relative" aria-labelledby="testimonials-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-semibold tracking-wider uppercase">
            What Traders Say
          </span>
          <h2 id="testimonials-heading" className="text-[clamp(1.75rem,4.5vw,3rem)] font-display font-extrabold">
            Loved by <span className="text-gradient-cosmic">100,000+</span> Traders
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Join a global community of traders who use Oracle Bull to get the edge.
          </p>
        </div>

        {/* Masonry-style testimonials grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="group relative flex flex-col gap-4 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/20 absolute top-5 right-5" />

              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Text */}
              <p className="text-foreground/80 text-sm leading-relaxed flex-1 relative z-10">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0", t.color)}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof numbers */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {[
            { value: "4.8/5", label: "Average Rating" },
            { value: "100K+", label: "Active Users" },
            { value: "195+", label: "Countries" },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-3xl font-display font-black text-foreground">{item.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
