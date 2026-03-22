import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface BannerAdProps {
  className?: string;
  slot?: string;
}

/**
 * Responsive banner ad optimized for viewability
 * - Desktop: 728x90 leaderboard
 * - Mobile: 320x50 mobile banner
 * - Fixed dimensions prevent CLS
 */
export const BannerAd = memo(function BannerAd({ className, slot }: BannerAdProps) {
  return (
    <div className={cn("w-full flex justify-center py-4", className)}>
      {/* Desktop banner - centered */}
      <div className="hidden md:flex justify-center">
        <LazyAd size="banner" slot={slot} />
      </div>
      {/* Mobile banner - centered */}
      <div className="flex md:hidden justify-center">
        <LazyAd size="mobile-banner" slot={slot} />
      </div>
    </div>
  );
});

export default BannerAd;
