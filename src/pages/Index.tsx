import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickStats } from "@/components/home/QuickStats";
import { ChainLinks } from "@/components/home/ChainLinks";
import { TopMovers } from "@/components/home/TopMovers";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { MarketOverview } from "@/components/home/MarketOverview";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mt-16">
        <CryptoTicker />
      </div>
      <HeroSection />
      <QuickStats />
      <ChainLinks />
      <TopMovers />
      <FeaturesSection />
      <CTASection />
      <MarketOverview />
      <Footer />
      <MobileBottomNav />
      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default Index;
