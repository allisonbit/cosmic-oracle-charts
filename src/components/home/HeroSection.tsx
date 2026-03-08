import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import cosmicOracle from "@/assets/oracle-bull-logo.jpg";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

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

  const { count: tokensCount, ref: tokensRef } = useCountUp(18000, 2500);
  const { count: chainsCount, ref: chainsRef } = useCountUp(8, 1500);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(85, 2000);

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden cosmic-bg" aria-labelledby="hero-heading">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03]" aria-hidden="true" />
      
      {/* Gradient orbs - GPU accelerated */}
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse gpu-accelerated" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-56 md:w-80 h-56 md:h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse gpu-accelerated" style={{ animationDelay: "1s" }} aria-hidden="true" />
      
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <article className="text-center lg:text-left space-y-6 md:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success text-xs md:text-sm font-medium">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
              <span>100% Free — No Signup Required</span>
            </div>
            
            <h1 id="hero-heading" className="text-[clamp(1.75rem,5vw,3.75rem)] font-bold leading-tight">
              <span className="text-gradient-cosmic">Institutional-Grade</span>
              <br />
              <span className="text-foreground font-extrabold">Crypto Analytics</span>
              <br />
              <span className="text-muted-foreground">Powered by AI</span>
            </h1>
            
            <p className="text-[clamp(0.875rem,2vw,1.125rem)] text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Real-time price predictions, whale tracking, sentiment analysis, and on-chain intelligence across <strong className="text-foreground">18,000+ cryptocurrencies</strong>. Access the same tools institutions use — completely free.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 border border-border/50 rounded-full px-3 py-1.5">
                  <Icon className="w-3 h-3 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            
            <nav className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start flex-wrap" aria-label="Primary actions">
              <Button asChild variant="cosmic" size="lg" className="text-sm md:text-base touch-target-lg tap-highlight-none active:scale-95 transition-transform shadow-lg shadow-primary/20">
                <Link to="/dashboard">
                  Open Live Dashboard
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glow" size="lg" className="text-sm md:text-base touch-target-lg tap-highlight-none active:scale-95 transition-transform">
                <Link to="/predictions">
                  AI Price Predictions
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                </Link>
              </Button>
            </nav>

            {/* Live price mini-ticker */}
            {topCoins.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                {topCoins.map((coin) => (
                  <Link
                    key={coin.symbol}
                    to={`/price-prediction/${coin.name.toLowerCase()}/daily`}
                    className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-3 py-2 hover:border-primary/30 transition-colors group"
                  >
                    <span className="font-bold text-sm text-foreground">{coin.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      ${coin.price?.toLocaleString(undefined, { maximumFractionDigits: coin.price > 100 ? 0 : 2 })}
                    </span>
                    <span className={`text-xs font-medium ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h?.toFixed(1)}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </article>
          
          {/* Oracle Image + Stats */}
          <figure className="relative flex flex-col items-center mt-8 lg:mt-0">
            {/* Glow ring */}
            <div className="absolute w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-2 border-primary/20 animate-pulse pulse-glow gpu-accelerated" aria-hidden="true" />
            <div className="absolute w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full border border-secondary/15 gpu-accelerated" style={{ animationDelay: "0.5s" }} aria-hidden="true" />
            
            {/* Oracle container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden float shadow-2xl shadow-primary/10">
              <img
                src={cosmicOracle}
                alt="Oracle Bull - AI-powered cryptocurrency forecasting mascot"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                width={420}
                height={420}
                sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" aria-hidden="true" />
            </div>

            {/* Floating stat cards */}
            <div className="absolute top-4 md:top-10 -left-2 md:left-0 holo-card p-2 md:p-3 float animate-fade-in shadow-lg" style={{ animationDelay: "0.3s" }} aria-label="Bitcoin trend indicator">
              <div className="text-xs text-muted-foreground">BTC Trend</div>
              <div className="text-sm md:text-lg font-bold text-success">Bullish ↑</div>
            </div>
            
            <div className="absolute bottom-16 md:bottom-20 -right-2 md:right-0 holo-card p-2 md:p-3 float-delayed animate-fade-in shadow-lg" style={{ animationDelay: "0.6s" }} aria-label="AI accuracy metric">
              <div className="text-xs text-muted-foreground">AI Accuracy</div>
              <div className="text-sm md:text-lg font-bold text-primary">85.4%</div>
            </div>
            
            {/* Animated stats below image */}
            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
              <div ref={tokensRef} className="text-center">
                <div className="text-lg md:text-xl font-bold text-foreground tabular-nums">{tokensCount.toLocaleString()}+</div>
                <div className="text-[10px] text-muted-foreground">Tokens</div>
              </div>
              <div ref={chainsRef} className="text-center">
                <div className="text-lg md:text-xl font-bold text-foreground tabular-nums">{chainsCount}</div>
                <div className="text-[10px] text-muted-foreground">Blockchains</div>
              </div>
              <div ref={accuracyRef} className="text-center">
                <div className="text-lg md:text-xl font-bold text-foreground tabular-nums">{accuracyCount}%</div>
                <div className="text-[10px] text-muted-foreground">AI Accuracy</div>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
