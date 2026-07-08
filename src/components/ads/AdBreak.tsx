import { AdsterraNative } from "./AdsterraNative";
import { AdsterraBanner } from "./AdsterraBanner";
import { AdsterraBanner300 } from "./AdsterraBanner300";
import { AdsterraBanner320 } from "./AdsterraBanner320";
import { AdsterraSmartlink } from "./AdsterraSmartlink";
import { AdUnit } from "./AdUnit";
import { LazyAd } from "./LazyAd";

interface AdBreakProps {
  variant?: "full" | "compact";
  className?: string;
}

export function AdBreak({ variant = "compact", className = "" }: AdBreakProps) {
  if (variant === "full") {
    return (
      <LazyAd className={`py-1 space-y-1 ${className}`}>
        <AdsterraBanner300 />
        <AdsterraSmartlink variant="banner" className="max-w-5xl mx-auto px-4" />
        <div className="hidden md:block">
          <AdsterraBanner />
        </div>
        <div className="block md:hidden">
          <AdsterraBanner320 />
        </div>
        <AdsterraNative className="max-w-5xl mx-auto px-4" />
        <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
      </LazyAd>
    );
  }

  return (
    <LazyAd className={`py-1 space-y-1 ${className}`}>
      <AdsterraBanner300 />
      <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
    </LazyAd>
  );
}
