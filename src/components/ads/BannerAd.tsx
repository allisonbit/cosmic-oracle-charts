import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface BannerAdProps {
  className?: string;
  slot?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const BannerAd = memo(function BannerAd({ className, slot, priority = 'low' }: BannerAdProps) {
  return (
    <div className={cn("w-full flex justify-center py-4", className)}>
      {/* Desktop banner */}
      <div className="hidden md:block">
        <LazyAd size="banner" slot={slot} priority={priority} />
      </div>
      {/* Mobile banner */}
      <div className="block md:hidden">
        <LazyAd size="mobile-banner" slot={slot} priority={priority} />
      </div>
    </div>
  );
});

export default BannerAd;