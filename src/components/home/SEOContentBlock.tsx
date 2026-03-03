import { Brain, Shield, Zap, BarChart3, Star, Quote, HelpCircle, Heart, Users, Clock, Globe, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

const testimonials = [
  {
    quote: "Oracle Bull's AI predictions helped me understand market cycles I was completely missing. The sentiment tracker is incredibly accurate.",
    name: "Alex K.",
    role: "Crypto Researcher",
    rating: 5,
  },
  {
    quote: "I use the Whale Tracker daily. Being able to see smart money movements before they impact price is a game-changer for my analysis.",
    name: "Sarah M.",
    role: "DeFi Analyst",
    rating: 5,
  },
  {
    quote: "The multi-chain analytics are phenomenal. I track Ethereum, Solana, and Arbitrum all from one dashboard. And it's completely free!",
    name: "James T.",
    role: "Portfolio Manager",
    rating: 5,
  },
  {
    quote: "Finally an analytics platform that doesn't require my email or credit card. The educational content alone is worth bookmarking.",
    name: "Maria L.",
    role: "Crypto Enthusiast",
    rating: 5,
  },
];

const platformStats = [
  { label: "Tokens Tracked", target: 18000, suffix: "+", color: "text-primary" },
  { label: "Blockchains", target: 8, suffix: "", color: "text-secondary" },
  { label: "Daily Predictions", target: 500, suffix: "+", color: "text-success" },
  { label: "Uptime", target: 99, suffix: ".9%", color: "text-warning" },
];

function AnimatedStat({ label, target, suffix, color }: { label: string; target: number; suffix: string; color: string }) {
  const { count, ref } = useCountUp(target, 2200);
  return (
    <div ref={ref} className="text-center p-4">
      <div className={`text-3xl md:text-4xl font-display font-bold ${color} tabular-nums`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <div
      className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 animate-fade-in"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
      
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-warning fill-warning" />
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">
        "{testimonial.quote}"
      </p>
      
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-sm text-foreground">{testimonial.name}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

export function SEOContentBlock() {
  return (
    <section className="py-12 md:py-16 border-b border-border/30" aria-labelledby="seo-content-heading">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase mb-4">
            Trusted Platform
          </span>
          <h2 id="seo-content-heading" className="text-2xl md:text-3xl font-display font-bold">
            Why Traders Choose <span className="glow-text">Oracle Bull</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl mx-auto text-sm md:text-base">
            Oracle Bull combines advanced AI algorithms with real-time blockchain data to deliver accurate cryptocurrency analysis. 
            Our platform serves researchers, developers, and traders worldwide — completely free, no signup required.
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
              Proprietary AI models analyze historical patterns, market cycles, and sentiment data to generate 
              daily, weekly, and monthly price analysis for Bitcoin, Ethereum, and 18,000+ altcoins.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Real-Time Data</h3>
            <p className="text-muted-foreground text-sm">
              Live price feeds updated every second. Track market movements as they happen with our 
              real-time cryptocurrency ticker and instant price alerts across all major exchanges.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Multi-Chain Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive blockchain analytics for Ethereum, Solana, Base, Arbitrum, Polygon, and more. 
              Monitor DeFi TVL, gas prices, transaction volumes, and ecosystem health in one dashboard.
            </p>
          </article>

          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Whale Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Follow smart money movements with our whale activity radar. Get alerts when large wallets 
              accumulate or distribute tokens, helping you spot trends before they go mainstream.
            </p>
          </article>
        </div>

        {/* Animated Stats Bar */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/20 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
            {platformStats.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-display font-bold text-center mb-8">
            What Our Users Say
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} testimonial={t} index={i} />
            ))}
          </div>
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
                keeping all core analytics tools, AI predictions, and educational content 100% free for retail users.
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
