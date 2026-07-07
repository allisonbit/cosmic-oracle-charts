import { ExternalLink } from "lucide-react";

interface AdsterraSmartlinkProps {
  className?: string;
  variant?: "button" | "text" | "banner";
}

const SMARTLINK_URL = "https://www.effectivecpmnetwork.com/u3mt6t8wv?key=14bd0561df5ff2ef73924bd92d873b81";

export function AdsterraSmartlink({ className = "", variant = "button" }: AdsterraSmartlinkProps) {
  if (variant === "text") {
    return (
      <a
        href={SMARTLINK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 transition-colors ${className}`}
      >
        Explore Top Crypto Offers <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (variant === "banner") {
    return (
      <a
        href={SMARTLINK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 hover:border-primary/40 transition-all group ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              Exclusive Crypto Deals & Offers
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Discover top platforms, bonuses & tools for traders
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground group-hover:bg-primary/90 transition-colors">
            Explore Now
          </span>
        </div>
      </a>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href={SMARTLINK_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
      >
        Explore Top Crypto Offers <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
