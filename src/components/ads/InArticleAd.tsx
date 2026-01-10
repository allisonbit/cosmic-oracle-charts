import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface InArticleAdProps {
  className?: string;
  slot?: string;
}

/**
 * In-article ad optimized for viewability
 * - Placed between content sections for high attention
 * - Fixed height prevents CLS
 * - Centered with proper spacing
 */
export const InArticleAd = memo(function InArticleAd({ className, slot }: InArticleAdProps) {
  return (
    <div 
      className={cn(
        "w-full flex justify-center my-8",
        "px-4 md:px-0", // Padding on mobile
        className
      )}
    >
      <div className="w-full max-w-2xl">
        <LazyAd size="in-article" slot={slot} className="w-full" />
      </div>
    </div>
  );
});

export default InArticleAd;