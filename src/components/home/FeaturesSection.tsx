import { 
  Activity, BarChart3, Brain, Globe, Radio, Shield, ArrowRight,
  TrendingUp, Zap, Eye, Target, BookOpen, Waves, LineChart, CandlestickChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mini chart component for the bento boxes
const MiniChart = ({ color = "text-primary", className }: { color?: string, className?: string }) => (
  <div className={cn("flex items-end gap-1 h-12 w-full mt-auto opacity-50", className)}>
    {[40, 60, 30, 70, 50, 90, 80, 100].map((h, i) => (
      <div 
        key={i} 
        className={cn("w-full rounded-t-sm", color.replace('text-', 'bg-'))} 
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" aria-labelledby="features-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20 space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
            Institutional Toolset
          </span>
          <h2 id="features-heading" className="text-[clamp(1.75rem,5vw,3.5rem)] font-display font-extrabold leading-tight tracking-tight">
            Trade with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Oracle's Vision</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-xl">
            Everything you need to analyze, predict, and conquer the crypto markets. All in one powerful, unified dashboard.
          </p>
        </div>
        
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 md:gap-6 max-w-6xl mx-auto auto-rows-[250px]">
          
          {/* Feature 1: AI Predictions (Large Block) */}
          <Link
            to="/predictions"
            className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 md:p-8 hover:border-primary/50 hover:shadow-[0_0_40px_-15px_hsl(var(--primary))] transition-all duration-500 flex flex-col tap-highlight-none"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-48 h-48 text-primary" />
            </div>
            
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-primary" />
            </div>
            
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
              AI-Powered Price Predictions
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md z-10">
              Our AI models analyze technical indicators, on-chain flows, and social sentiment to forecast price movements, with a transparent confidence score on every prediction.
            </p>
            
            {/* Mock UI snippet inside card */}
            <div className="mt-auto pt-8 flex gap-3 z-10">
              <div className="flex-1 bg-background/50 rounded-xl p-3 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">BTC Confidence</div>
                <div className="text-lg font-bold text-success flex items-center gap-1">89% Buy <TrendingUp className="w-3 h-3"/></div>
              </div>
              <div className="flex-1 bg-background/50 rounded-xl p-3 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">ETH Target</div>
                <div className="text-lg font-bold text-foreground">$3,850.00</div>
              </div>
            </div>
          </Link>

          {/* Feature 2: Real-time Dashboard */}
          <Link
            to="/dashboard"
            className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-secondary/50 hover:shadow-[0_0_40px_-15px_hsl(var(--secondary))] transition-all duration-500 flex flex-col md:flex-row items-center gap-6 tap-highlight-none"
          >
            <div className="flex-1 space-y-3 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-secondary transition-colors">Live Market Dashboard</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Track global momentum, sector performance, and volume leaders in real-time. Zero delay.
              </p>
            </div>
            <div className="w-full md:w-1/3 flex-shrink-0">
               <MiniChart color="text-secondary" />
            </div>
          </Link>

          {/* Feature 3: Token Explorer */}
          <Link
            to="/explorer"
            className="md:col-span-1 md:row-span-2 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-chart-2/50 hover:shadow-[0_0_30px_-15px_hsl(var(--chart-2))] transition-all duration-500 flex flex-col tap-highlight-none"
          >
             <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-chart-2" />
            </div>
            <h3 className="font-display text-lg font-bold mb-2 text-foreground group-hover:text-chart-2 transition-colors">Multi-Chain Explorer</h3>
            <p className="text-muted-foreground text-sm flex-1">
              Search any token across 8 blockchains. Instantly view liquidity depth, holder distribution, and risk scores.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['ETH', 'SOL', 'BASE', 'ARB'].map(c => (
                <span key={c} className="text-[10px] bg-background px-2 py-1 rounded-md border border-border/50">{c}</span>
              ))}
            </div>
          </Link>

          {/* Feature 4: Wallet Scanner */}
          <Link
            to="/scanner"
            className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-warning/50 hover:shadow-[0_0_30px_-15px_hsl(var(--warning))] transition-all duration-500 flex flex-col justify-between tap-highlight-none"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-display text-lg font-bold group-hover:text-warning transition-colors">Wallet Scanner</h3>
              <Shield className="w-5 h-5 text-warning/70" />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              Analyze any address for holdings, PnL, and AI risk assessment.
            </p>
          </Link>

           {/* Feature 5: Sentiment Analysis */}
           <Link
            to="/sentiment"
            className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-chart-4/50 hover:shadow-[0_0_30px_-15px_hsl(var(--chart-4))] transition-all duration-500 flex flex-col justify-between tap-highlight-none"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-display text-lg font-bold group-hover:text-chart-4 transition-colors">Social Sentiment</h3>
              <Radio className="w-5 h-5 text-chart-4/70" />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              Track fear/greed and social buzz before it hits the charts.
            </p>
          </Link>
          
          {/* Feature 6: Educational Hub (Bottom Spanner) */}
          <Link
            to="/learn"
            className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-500 flex items-center gap-4 tap-highlight-none"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">Educational Hub</h3>
              <p className="text-muted-foreground text-sm hidden sm:block">Master crypto markets with our comprehensive learning resources.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 md:mt-20">
          <Button asChild variant="cosmic" size="lg" className="rounded-full px-8 text-base shadow-[0_0_40px_-15px_hsl(var(--primary))]">
            <Link to="/dashboard">
              Start Exploring for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
