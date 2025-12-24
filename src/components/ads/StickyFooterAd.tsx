import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StickyFooterAdProps {
  className?: string;
  slot?: string;
}

export const StickyFooterAd = ({ className, slot }: StickyFooterAdProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border py-2 px-4",
        className
      )}
      data-ad-slot={slot}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-center bg-muted/30 border border-border/50 rounded-lg overflow-hidden h-[50px] md:h-[90px] w-full max-w-[320px] md:max-w-[728px]">
          <span className="text-muted-foreground text-sm opacity-50">
            Sticky Footer Ad
          </span>
        </div>
      </div>
    </div>
  );
};

export default StickyFooterAd;
