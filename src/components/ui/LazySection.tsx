import { ReactNode, memo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  fallbackHeight?: string;
  rootMargin?: string;
}

export const LazySection = memo(function LazySection({
  children,
  className,
  fallbackHeight = "h-64",
  rootMargin = "200px",
}: LazySectionProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        <div className={cn("holo-card animate-pulse", fallbackHeight)}>
          <div className="p-4 sm:p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
