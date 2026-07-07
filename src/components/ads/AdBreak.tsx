import { AdsterraNative } from "./AdsterraNative";
import { AdsterraBanner } from "./AdsterraBanner";
import { AdsterraBanner300 } from "./AdsterraBanner300";
import { AdsterraBanner320 } from "./AdsterraBanner320";
import { AdsterraSmartlink } from "./AdsterraSmartlink";
import { AdUnit } from "./AdUnit";

interface AdBreakProps {
  variant?: "full" | "compact";
  className?: string;
}

export function AdBreak({ variant = "compact", className = "" }: AdBreakProps) {
  if (variant === "full") {
    return (
      <div className={`py-4 space-y-4 ${className}`}>
        <AdsterraNative className="max-w-5xl mx-auto px-4" />
        <div className="hidden md:block">
          <AdsterraBanner />
        </div>
        <div className="block md:hidden">
          <AdsterraBanner320 />
        </div>
        <AdsterraBanner300 />
        <AdsterraSmartlink variant="banner" className="max-w-5xl mx-auto px-4" />
        <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
      </div>
    );
  }

  return (
    <div className={`py-3 space-y-3 ${className}`}>
      <div className="hidden md:block">
        <AdsterraBanner />
      </div>
      <div className="block md:hidden">
        <AdsterraBanner320 />
      </div>
      <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
    </div>
  );
}
