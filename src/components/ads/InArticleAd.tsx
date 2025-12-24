import { cn } from "@/lib/utils";
import { AdPlacement } from "./AdPlacement";

interface InArticleAdProps {
  className?: string;
  slot?: string;
}

export const InArticleAd = ({ className, slot }: InArticleAdProps) => {
  return (
    <div className={cn("w-full flex justify-center", className)}>
      <AdPlacement size="in-article" slot={slot} className="w-full max-w-2xl" />
    </div>
  );
};

export default InArticleAd;
