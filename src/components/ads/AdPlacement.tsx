import { cn } from "@/lib/utils";

type AdSize = 
  | "banner" // 728x90 - top/bottom of pages
  | "leaderboard" // 970x90 - wide banner
  | "rectangle" // 300x250 - sidebar/in-content
  | "skyscraper" // 160x600 - sidebar vertical
  | "mobile-banner" // 320x50 - mobile header/footer
  | "in-article" // responsive - between content
  | "sticky-footer"; // 320x50/728x90 - sticky bottom

interface AdPlacementProps {
  size: AdSize;
  className?: string;
  slot?: string; // Google AdSense slot ID
}

const sizeConfig: Record<AdSize, { width: string; height: string; label: string }> = {
  banner: { width: "728px", height: "90px", label: "Banner Ad" },
  leaderboard: { width: "970px", height: "90px", label: "Leaderboard" },
  rectangle: { width: "300px", height: "250px", label: "Rectangle" },
  skyscraper: { width: "160px", height: "600px", label: "Skyscraper" },
  "mobile-banner": { width: "320px", height: "50px", label: "Mobile Banner" },
  "in-article": { width: "100%", height: "auto", label: "In-Article" },
  "sticky-footer": { width: "100%", height: "auto", label: "Sticky Footer" },
};

export const AdPlacement = ({ size, className, slot }: AdPlacementProps) => {
  const config = sizeConfig[size];

  // Placeholder component - replace with actual AdSense code when ready
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/30 border border-border/50 rounded-lg overflow-hidden",
        size === "sticky-footer" && "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm py-2",
        size === "in-article" && "my-6 min-h-[250px]",
        className
      )}
      style={{
        maxWidth: config.width,
        minHeight: size === "in-article" ? "250px" : config.height,
      }}
      data-ad-slot={slot}
      data-ad-size={size}
    >
      <div className="text-muted-foreground text-sm opacity-50">
        {config.label}
      </div>
    </div>
  );
};

export default AdPlacement;
