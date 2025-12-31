import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface BannerAdProps {
  className?: string;
  slot?: string;
}

export const BannerAd = memo(function BannerAd({ className, slot }: BannerAdProps) {
  return (
    <div className={cn("w-full flex justify-center py-4", className)}>
      {/* Desktop banner */}
      <div className="hidden md:block">
        <LazyAd size="banner" slot={slot} />
      </div>
      {/* Mobile banner */}
      <div className="block md:hidden">
        <LazyAd size="mobile-banner" slot={slot} />
      </div>
    </div>
  );
});

export default BannerAd;