import { cn } from "@/lib/utils";
import { memo } from "react";
import { AdSlot } from "./AdSlot";

interface SidebarAdProps {
  className?: string;
  /** Ignored — retained for backward compat with existing call sites. */
  slot?: string;
  variant?: "rectangle" | "skyscraper";
}

/**
 * Desktop right-rail sidebar ad (hidden on mobile). Routes through the AdSlot
 * coordinator for live Adsterra inventory (previously dead AdSense). Uses a
 * 300x250 rectangle — Adsterra has no 160x600 HPF unit configured, so the
 * "skyscraper" variant also maps to rectangle.
 */
export const SidebarAd = memo(function SidebarAd({ className }: SidebarAdProps) {
  return (
    <div className={cn("hidden lg:block", className)}>
      <div className="sticky top-20">
        <AdSlot variant="rectangle" />
      </div>
    </div>
  );
});

export default SidebarAd;
