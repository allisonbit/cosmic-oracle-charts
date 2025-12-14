import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import cosmicOracle from "@/assets/oracle-bull-logo.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cosmic-bg" aria-labelledby="hero-heading">
      {/* Star field overlay */}
      <div className="absolute inset-0 stars opacity-50" aria-hidden="true" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-56 md:w-80 h-56 md:h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} aria-hidden="true" />
      
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <article className="text-center lg:text-left space-y-6 md:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
              <span>AI-Powered Crypto Forecasts</span>
            </div>
            
            <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="glow-text">ORACLE</span>
              <br />
              <span className="text-gradient-cosmic">CRYPTO</span>
              <br />
              <span className="text-foreground">FORECASTS</span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Your AI guide through the crypto universe. Beautiful predictions, 
              real-time charts, and market insights — all free and open access.
            </p>
            
            <nav className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start" aria-label="Primary actions">
              <Button asChild variant="cosmic" size="lg" className="text-sm md:text-base touch-target-lg tap-highlight-none active:scale-95 transition-transform">
                <Link to="/dashboard">
                  Explore Dashboard
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="glow" size="lg" className="text-sm md:text-base touch-target-lg tap-highlight-none active:scale-95 transition-transform">
                <Link to="/learn">
                  Learn More
                </Link>
              </Button>
            </nav>
          </article>
          
          {/* Oracle Image */}
          <figure className="relative flex justify-center items-center mt-8 lg:mt-0">
            {/* Glow ring */}
            <div className="absolute w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full border-2 border-primary/30 animate-pulse pulse-glow" aria-hidden="true" />
            <div className="absolute w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full border border-secondary/20" style={{ animationDelay: "0.5s" }} aria-hidden="true" />
            
            {/* Oracle container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden float">
              <img
                src={cosmicOracle}
                alt="Oracle Bull - AI-powered cryptocurrency forecasting mascot"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true" />
            </div>
            
            {/* Floating data cards */}
            <div className="absolute top-4 md:top-10 -left-2 md:left-0 holo-card p-2 md:p-3 float animate-fade-in" style={{ animationDelay: "0.3s" }} aria-label="Bitcoin trend indicator">
              <div className="text-xs text-muted-foreground font-display">BTC TREND</div>
              <div className="text-sm md:text-lg font-bold text-success">BULLISH</div>
            </div>
            
            <div className="absolute bottom-16 md:bottom-20 -right-2 md:right-0 holo-card p-2 md:p-3 float-delayed animate-fade-in" style={{ animationDelay: "0.6s" }} aria-label="Market status indicator">
              <div className="text-xs text-muted-foreground font-display">MARKET</div>
              <div className="text-sm md:text-lg font-bold text-primary">ACTIVE</div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
