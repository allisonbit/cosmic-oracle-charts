import { useState, useEffect, memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LazyAd } from "./LazyAd";

interface StickyFooterAdProps {
  className?: string;
  slot?: string;
  /** Delay before showing ad (ms) - improves UX */
  showDelay?: number;
}

/**
 * Sticky footer ad with dismiss button
 * - Appears after scroll delay for better UX
 * - Fixed positioning with safe area padding
 * - Dismissible to improve user experience
 */
export const StickyFooterAd = memo(function StickyFooterAd({ 
  className, 
  slot,
  showDelay = 3000 
}: StickyFooterAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Delay showing ad for better UX
  useEffect(() => {
    if (isDismissed) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay, isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur-sm border-t border-border",
        "py-2 px-4 pb-safe",
        "transition-transform duration-300",
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 z-10"
          onClick={() => setIsDismissed(true)}
          aria-label="Close advertisement"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Desktop banner */}
        <div className="hidden md:flex justify-center">
          <LazyAd size="banner" slot={slot} />
        </div>
        {/* Mobile banner */}
        <div className="flex md:hidden justify-center">
          <LazyAd size="mobile-banner" slot={slot} />
        </div>
      </div>
    </div>
  );
});

export default StickyFooterAd;