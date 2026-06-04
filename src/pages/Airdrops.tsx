import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Gift, Brain, Target, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { AirdropList } from "@/components/airdrops/AirdropList";
import { AirdropStats } from "@/components/airdrops/AirdropStats";
import { FeaturedAirdrop } from "@/components/airdrops/FeaturedAirdrop";
import { WalletEligibilityChecker } from "@/components/airdrops/WalletEligibilityChecker";
import { SafetyBanner } from "@/components/airdrops/SafetyBanner";
import { WidgetErrorBoundary } from "@/components/system/RouteErrorBoundary";

const Airdrops = () => {
  return (
    <Layout>
      <Helmet>
        <title>Best Crypto Airdrops 2026 — AI Ranked & Verified | Oracle Bull</title>
        <meta name="description" content="Discover the highest-value crypto airdrops ranked by Oracle Bull AI. Each drop scored for legitimacy, effort:reward ratio, and estimated value. Includes wallet eligibility checker and scam protection." />
        <meta name="keywords" content="crypto airdrops 2026, best airdrops, airdrop tracker, token airdrop, wallet eligibility, AI airdrop score, upcoming airdrops, verified airdrops" />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">

        {/* Safety Banner */}
        <WidgetErrorBoundary><SafetyBanner /></WidgetErrorBoundary>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/20 mb-8 p-6 md:p-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider mb-4">
              <Gift className="w-4 h-4" />
              <span>AI AIRDROP INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4 text-foreground glow-text">
              Crypto Airdrops <span className="text-primary">AI Ranked</span> & Verified
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl">
              Don't farm blind. Oracle Bull AI scores every airdrop on legitimacy, effort-to-reward ratio, and estimated value — so you know exactly which drops are worth your time.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Brain className="w-4 h-4 text-primary" />, label: "AI Confidence Scoring" },
                { icon: <Target className="w-4 h-4 text-primary" />, label: "Effort:Reward Ratio" },
                { icon: <CheckCircle2 className="w-4 h-4 text-success" />, label: "Scam Protection" },
                { icon: <TrendingUp className="w-4 h-4 text-warning" />, label: "Live Countdowns" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 px-3 py-2 rounded-lg border border-border">
                  {icon} <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <WidgetErrorBoundary><AirdropStats /></WidgetErrorBoundary>

        {/* Featured Airdrop of the Week */}
        <WidgetErrorBoundary><FeaturedAirdrop /></WidgetErrorBoundary>

        {/* Wallet Eligibility Checker */}
        <WidgetErrorBoundary><WalletEligibilityChecker /></WidgetErrorBoundary>

        {/* Main List */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-foreground">All Ranked Airdrops</h2>
              <p className="text-xs text-muted-foreground">Scored by Oracle Bull AI · Updated daily</p>
            </div>
          </div>
          <WidgetErrorBoundary><AirdropList /></WidgetErrorBoundary>
        </div>

      </div>
    </Layout>
  );
};

export default Airdrops;
