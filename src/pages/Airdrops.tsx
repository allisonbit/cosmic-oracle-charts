import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Gift, Sparkles, Brain, ArrowRight, Zap, Target, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AirdropList } from "@/components/airdrops/AirdropList";
import { AirdropStats } from "@/components/airdrops/AirdropStats";

const Airdrops = () => {
  return (
    <Layout>
      <Helmet>
        <title>Crypto Airdrops & Presales Tracker | Oracle Bull</title>
        <meta name="description" content="Discover the best upcoming crypto airdrops and presales. Our AI analyzes farming difficulty, expected value, and legitimacy to give you the highest conviction airdrop opportunities." />
        <meta name="keywords" content="crypto airdrops, best presales, token airdrop tracker, upcoming crypto airdrops 2024, web3 airdrops, testnet airdrops" />
      </Helmet>
      
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/20 mb-8 p-6 md:p-10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider mb-4">
              <Gift className="w-4 h-4" />
              <span>AI AIRDROP INTELLIGENCE</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4 text-foreground glow-text">
              Top Crypto <span className="text-primary">Airdrops</span> & Presales
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl">
              Don't farm blind. Our AI analyzes on-chain activity, venture capital funding, and project momentum to rank the most lucrative upcoming airdrop opportunities.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-4 py-2 rounded-lg border border-border">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI Confidence Scoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-4 py-2 rounded-lg border border-border">
                <Target className="w-4 h-4 text-primary" />
                <span>ROI Projections</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-4 py-2 rounded-lg border border-border">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Scam Detection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <AirdropStats />

        {/* Main Content Area */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                High-Conviction Airdrops
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Curated list of the highest value opportunities currently active.</p>
            </div>
          </div>

          <AirdropList />
        </div>
        
      </div>
    </Layout>
  );
};

export default Airdrops;
