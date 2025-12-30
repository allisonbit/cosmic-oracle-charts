import { cn } from "@/lib/utils";
import { memo } from "react";
import { LazyAd } from "./LazyAd";

interface InArticleAdProps {
  className?: string;
  slot?: string;
}

export const InArticleAd = memo(function InArticleAd({ className, slot }: InArticleAdProps) {
  return (
    <div className={cn("w-full flex justify-center my-8", className)}>
      <LazyAd size="in-article" slot={slot} className="w-full max-w-2xl" />
    </div>
  );
});

export default InArticleAd;