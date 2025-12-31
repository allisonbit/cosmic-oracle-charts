import { useState, memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LazyAd } from "./LazyAd";

interface StickyFooterAdProps {
  className?: string;
  slot?: string;
}

export const StickyFooterAd = memo(function StickyFooterAd({ className, slot }: StickyFooterAdProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border py-2 px-4 pb-safe",
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => setIsVisible(false)}
          aria-label="Close advertisement"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="hidden md:block">
          <LazyAd size="banner" slot={slot} />
        </div>
        <div className="block md:hidden">
          <LazyAd size="mobile-banner" slot={slot} />
        </div>
      </div>
    </div>
  );
});

export default StickyFooterAd;