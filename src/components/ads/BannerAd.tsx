import { cn } from "@/lib/utils";
import { AdPlacement } from "./AdPlacement";

interface BannerAdProps {
  className?: string;
  slot?: string;
}

export const BannerAd = ({ className, slot }: BannerAdProps) => {
  return (
    <div className={cn("w-full flex justify-center py-4", className)}>
      <AdPlacement size="banner" slot={slot} className="hidden md:flex" />
      <AdPlacement size="mobile-banner" slot={slot} className="flex md:hidden" />
    </div>
  );
};

export default BannerAd;
