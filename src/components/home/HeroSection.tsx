import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Users, TrendingUp, CheckCircle, Activity, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import cosmicOracle from "@/assets/oracle-bull-logo.jpg";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { cn } from "@/lib/utils";

// Animated counter for hero stats
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
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
  }, [started, target, duration]);

  return { count, ref };
}

const trustBadges = [
  { icon: Shield, label: "No signup needed" },
  { icon: Users, label: "100K+ monthly users" },
  { icon: TrendingUp, label: "18,000+ tokens tracked" },
];

export function HeroSection() {
  const { data } = useCryptoPrices();
  const topCoins = data?.prices?.slice(0, 3) || [];

  // Preload LCP image dynamically with correct bundled path
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = cosmicOracle;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const { count: tokensCount, ref: tokensRef } = useCountUp(18420, 2500);
  const { count: chainsCount, ref: chainsRef } = useCountUp(8, 1500);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(85, 2000);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden cosmic-bg pt-20 pb-16" aria-labelledby="hero-heading">
      {/* Immersive Dynamic Background */}
      <div className="absolute inset-0 bg-background" aria-hidden="true" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      
      {/* Deep Space Gradients - GPU Accelerated */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow translate-x-1/3 -translate-y-1/4 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[100px] animate-pulse-slow -translate-x-1/4 translate-y-1/3 pointer-events-none" style={{ animationDelay: "2s" }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
          
          {/* ═════════ LEFT COLUMN: TYPOGRAPHY & CTA ═════════ */}
          <article className="text-center lg:text-left space-y-8 animate-fade-in flex flex-col items-center lg:items-start">
            
            {/* Live Data Badge */}
            <Link to="/predictions" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors group tap-highlight-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>AI Engine Live: BTC confidence upgraded</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            {/* Ultra-Premium Heading */}
            <h1 id="hero-heading" className="text-[clamp(2.5rem,6vw,4.5rem)] font-display font-extrabold leading-[1.05] tracking-tight text-foreground">
              Institutional <span className="text-gradient-cosmic">Edge,</span>
              <br className="hidden sm:block" />
              Now Open to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">Everyone.</span>
            </h1>
            
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground max-w-xl leading-relaxed">
              Real-time price predictions, on-chain intelligence, and whale tracking across <strong className="text-foreground">18,000+ assets</strong>. Access the same predictive tools hedge funds use — completely free.
            </p>

            {/* Premium CTA Buttons */}
            <nav className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" aria-label="Primary actions">
              <Button asChild size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_hsl(var(--primary))] transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/dashboard">
                  Launch Dashboard
                  <Activity className="w-5 h-5 ml-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold rounded-2xl border-border/50 bg-background/50 backdrop-blur-md hover:bg-accent hover:text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/predictions">
                  View AI Predictions
                  <Sparkles className="w-5 h-5 ml-2 text-primary" aria-hidden="true" />
                </Link>
              </Button>
            </nav>

            {/* Trust Badges - Glassmorphic row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <div className="flex -space-x-3 mr-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold bg-muted text-muted-foreground z-[${5-i}]`}>
                    {i === 4 ? '+100k' : <Users className="w-3 h-3" />}
                  </div>
                ))}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-foreground">Trusted by 100K+ Traders</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" /> No signup required</span>
              </div>
            </div>
          </article>
          
          {/* ═════════ RIGHT COLUMN: INTERACTIVE MASCOT & LIVE DATA ═════════ */}
          <figure className="relative flex flex-col items-center mt-12 lg:mt-0 lg:ml-auto w-full max-w-[500px] lg:max-w-none">
            
            {/* The Mascot - Floating inside a glass orb */}
            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[460px] lg:h-[460px] flex items-center justify-center">
              
              {/* Orbital Rings */}
              <div className="absolute inset-0 rounded-full border border-primary/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-secondary/15 animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Mascot Image */}
              <div className="relative w-[75%] h-[75%] rounded-full overflow-hidden float shadow-[0_0_80px_-20px_hsl(var(--primary))] border border-primary/20 z-10">
                <img
                  src={cosmicOracle}
                  alt="Oracle Bull AI"
                  className="w-full h-full object-cover scale-[1.02]"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent mix-blend-multiply" aria-hidden="true" />
              </div>

              {/* Live Data Widgets Floating Around */}
              {topCoins.length >= 2 && (
                <>
                  <div className="absolute top-4 left-0 sm:left-4 z-20 glass-panel p-3 rounded-xl border border-border/50 shadow-xl float animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs text-muted-foreground font-medium">{topCoins[0].symbol} Signal</span>
                    </div>
                    <div className="text-lg font-bold text-success flex items-center gap-1">
                      Strong Buy <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-12 right-0 sm:-right-4 z-20 glass-panel p-3 rounded-xl border border-border/50 shadow-xl float-delayed animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-warning" />
                      <span className="text-xs text-muted-foreground font-medium">Model Accuracy</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      <span ref={accuracyRef}>{accuracyCount}</span>.4%
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Stats Bar below the orb */}
            <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-8 glass-panel p-4 rounded-2xl border border-border/40 text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div ref={tokensRef}>
                <div className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight">{(tokensCount ?? 0).toLocaleString()}+</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Assets Tracked</div>
              </div>
              <div ref={chainsRef} className="border-l border-border/50">
                <div className="text-xl md:text-2xl font-display font-bold text-foreground tracking-tight">{chainsCount}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Blockchains</div>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
