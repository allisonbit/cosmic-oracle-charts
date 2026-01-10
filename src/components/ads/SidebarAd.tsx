import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface SidebarAdProps {
  className?: string;
  slot?: string;
  variant?: "rectangle" | "skyscraper";
}

/**
 * Sidebar ad for desktop right-rail placement
 * - Hidden on mobile to prevent layout issues
 * - Rectangle (300x250) or Skyscraper (160x600)
 * - High viewability in sidebar position
 */
export const SidebarAd = memo(function SidebarAd({ 
  className, 
  slot, 
  variant = "rectangle" 
}: SidebarAdProps) {
  return (
    <div className={cn("hidden lg:block", className)}>
      <div className="sticky top-20">
        <LazyAd size={variant} slot={slot} />
      </div>
    </div>
  );
});

export default SidebarAd;
