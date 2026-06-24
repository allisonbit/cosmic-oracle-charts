import { cn } from "@/lib/utils";
import { memo } from "react";
import { AdSlot } from "./AdSlot";

interface InArticleAdProps {
  className?: string;
  /** Ignored — retained for backward compat with existing call sites. */
  slot?: string;
}

/**
 * In-article ad placed between content sections. Routes through the AdSlot
 * coordinator for live Adsterra inventory (previously dead AdSense). Multiple
 * in-article ads on one page are handled safely: the coordinator gives the
 * first the HPF unit and later ones native/smartlink, so they never collide.
 */
export const InArticleAd = memo(function InArticleAd({ className }: InArticleAdProps) {
  return (
    <div className={cn("w-full flex justify-center my-8 px-4 md:px-0", className)}>
      <div className="w-full max-w-2xl">
        <AdSlot variant="banner" className="w-full" />
      </div>
    </div>
  );
});

export default InArticleAd;
