import { SignalsLayout } from "@/components/signals/SignalsLayout";
import { HeroSection } from "@/components/signals/home/HeroSection";
import { LiveResultsTicker } from "@/components/signals/home/LiveResultsTicker";
import { HowItWorks } from "@/components/signals/home/HowItWorks";
import { Benefits } from "@/components/signals/home/Benefits";
import { Testimonials } from "@/components/signals/home/Testimonials";
import { SignalExample } from "@/components/signals/home/SignalExample";
import { PricingPreview } from "@/components/signals/home/PricingPreview";
import { FAQPreview } from "@/components/signals/home/FAQPreview";
import { FinalCTA } from "@/components/signals/home/FinalCTA";
import { ProofBar } from "@/components/signals/home/ProofBar";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <SignalsLayout>
      <Helmet>
        <title>OracleBull — Crypto Trading Signals | 85%+ Win Rate</title>
        <meta name="description" content="Join 12,000+ traders profiting with OracleBull crypto signals. 85.4% win rate, real-time Telegram alerts, expert analysis. Start free today." />
      </Helmet>
      <HeroSection />
      <ProofBar />
      <LiveResultsTicker />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <SignalExample />
      <PricingPreview />
      <FAQPreview />
      <FinalCTA />
    </SignalsLayout>
  );
};

export default Index;
