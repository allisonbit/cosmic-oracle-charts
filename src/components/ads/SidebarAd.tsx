import { cn } from "@/lib/utils";
import { AdPlacement } from "./AdPlacement";

interface SidebarAdProps {
  className?: string;
  slot?: string;
  variant?: "rectangle" | "skyscraper";
}

export const SidebarAd = ({ className, slot, variant = "rectangle" }: SidebarAdProps) => {
  return (
    <div className={cn("hidden lg:block", className)}>
      <AdPlacement size={variant} slot={slot} />
    </div>
  );
};

export default SidebarAd;
