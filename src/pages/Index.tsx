import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { MarketOverview } from "@/components/home/MarketOverview";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mt-16">
        <CryptoTicker />
      </div>
      <HeroSection />
      <FeaturesSection />
      <MarketOverview />
      <Footer />
    </div>
  );
};

export default Index;
