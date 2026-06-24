import { cn } from "@/lib/utils";
import { memo } from "react";
import { AdSlot } from "./AdSlot";

interface BannerAdProps {
  className?: string;
  /** Ignored — retained for backward compat with existing call sites. */
  slot?: string;
}

/**
 * Responsive banner ad. Routes through the AdSlot coordinator so it serves live
 * Adsterra inventory (the first banner-style slot on a page becomes the page's
 * single HPF 728x90/320x50 unit; later slots fall back to native/smartlink).
 * Previously rendered dead AdSense.
 */
export const BannerAd = memo(function BannerAd({ className }: BannerAdProps) {
  return <AdSlot variant="banner" className={cn("py-4", className)} />;
});

export default BannerAd;
