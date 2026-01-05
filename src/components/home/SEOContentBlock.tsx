import { Brain, Shield, Zap, BarChart3 } from "lucide-react";

export function SEOContentBlock() {
  return (
    <section className="py-12 md:py-16 border-b border-border/30" aria-labelledby="seo-content-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8 md:mb-12">
          <h2 id="seo-content-heading" className="text-2xl md:text-3xl font-display font-bold">
            Why Choose <span className="glow-text">Oracle Bull</span> for Crypto Analytics?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl mx-auto text-sm md:text-base">
            Oracle Bull combines advanced AI algorithms with real-time blockchain data to deliver accurate cryptocurrency forecasts. 
            Our platform analyzes market sentiment, whale movements, and on-chain metrics to help you make informed trading decisions.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article className="holo-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">AI-Powered Predictions</h3>
            <p className="text-muted-foreground text-sm">
              Our proprietary AI models analyze historical patterns, market cycles, and sentiment data to generate 
              daily, weekly, and monthly price predictions for Bitcoin, Ethereum, and 1000+ altcoins.
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

        <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-display font-bold text-xl md:text-2xl mb-3">
                Trusted by <span className="text-primary">10,000+</span> Traders Worldwide
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Join the growing community of crypto traders who rely on Oracle Bull for their daily market analysis. 
                Our platform is completely free to use with no signup required. Access professional-grade analytics 
                that were previously only available to institutional investors.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-display font-bold text-primary">1000+</div>
                <div className="text-xs text-muted-foreground">Tokens Tracked</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-display font-bold text-secondary">8</div>
                <div className="text-xs text-muted-foreground">Blockchains</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-display font-bold text-success">24/7</div>
                <div className="text-xs text-muted-foreground">Live Updates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
