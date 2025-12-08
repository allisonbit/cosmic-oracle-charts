import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import cosmicOracle from "@/assets/cosmic-oracle-hero.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cosmic-bg">
      {/* Star field overlay */}
      <div className="absolute inset-0 stars opacity-50" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Crypto Forecasts
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="text-gradient-cosmic">COSMIC</span>
              <br />
              <span className="text-foreground">CRYPTO</span>
              <br />
              <span className="glow-text">FORECASTS</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Your AI guide through the crypto universe. Beautiful predictions, 
              real-time charts, and market insights — all free and open access.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild variant="cosmic" size="lg">
                <Link to="/dashboard">
                  Explore Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="glow" size="lg">
                <Link to="/learn">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Oracle Image */}
          <div className="relative flex justify-center items-center">
            {/* Glow ring */}
            <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full border-2 border-primary/30 animate-pulse pulse-glow" />
            <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-secondary/20" style={{ animationDelay: "0.5s" }} />
            
            {/* Oracle container */}
            <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] rounded-full overflow-hidden float">
              <img
                src={cosmicOracle}
                alt="Cosmic Oracle - AI Crypto Guide"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
            
            {/* Floating data cards */}
            <div className="absolute top-10 -left-4 md:left-0 holo-card p-3 float animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-xs text-muted-foreground font-display">BTC TREND</div>
              <div className="text-lg font-bold text-success">BULLISH</div>
            </div>
            
            <div className="absolute bottom-20 -right-4 md:right-0 holo-card p-3 float-delayed animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="text-xs text-muted-foreground font-display">MARKET</div>
              <div className="text-lg font-bold text-primary">ACTIVE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
