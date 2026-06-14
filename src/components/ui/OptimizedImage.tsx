import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Fallback displayed while image loads or if it fails */
  fallbackSrc?: string;
  /** Additional wrapper classes */
  wrapperClassName?: string;
}

/**
 * OptimizedImage — a drop-in `<img>` replacement with:
 * - Native lazy loading (`loading="lazy"`)
 * - Intersection Observer for below-fold deferral
 * - Fade-in animation on load
 * - Graceful fallback on error
 * - `decoding="async"` for non-blocking decode
 */
export function OptimizedImage({
  src,
  alt = "",
  fallbackSrc = "/placeholder.svg",
  className,
  wrapperClassName,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before entering viewport
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const imageSrc = error ? fallbackSrc : src;

  return (
    <div ref={imgRef} className={cn("overflow-hidden", wrapperClassName)}>
      {inView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}
