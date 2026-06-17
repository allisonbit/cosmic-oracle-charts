import { memo, useEffect, useRef, useState, type ReactNode } from "react";

// Render everything immediately for crawlers (SEO parity with prerender).
const isBot =
  typeof navigator !== "undefined" &&
  /Googlebot|bingbot|Baiduspider|yandex|DuckDuckBot|Slurp|ia_archiver|AhrefsBot|facebookexternalhit|Twitterbot|LinkedInBot|GPTBot|ClaudeBot|ChatGPT/i.test(
    navigator.userAgent,
  );

// One shared IntersectionObserver for every ViewportSection on the page.
// Replaces N per-section observers with a single multiplexed one — fewer
// observer instances, smaller memory footprint, less main-thread work.
type Callback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, Callback>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cb = callbacks.get(entry.target);
          if (cb) {
            sharedObserver!.unobserve(entry.target);
            callbacks.delete(entry.target);
            cb();
          }
        }
      },
      { rootMargin: "200px" },
    );
  }
  return sharedObserver;
}

interface ViewportSectionProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const ViewportSection = memo(function ViewportSection({
  children,
  fallback,
}: ViewportSectionProps) {
  const [isVisible, setIsVisible] = useState(isBot);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    const observer = getObserver();
    if (!node || !observer) {
      // No IO support → render immediately (same as bot path).
      setIsVisible(true);
      return;
    }
    callbacks.set(node, () => setIsVisible(true));
    observer.observe(node);
    return () => {
      observer.unobserve(node);
      callbacks.delete(node);
    };
  }, [isVisible]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
});