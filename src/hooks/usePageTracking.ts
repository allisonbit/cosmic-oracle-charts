import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    adsbygoogle?: { push: (params: object) => void }[];
  }
}

/**
 * Enhanced GA4 page tracking for SPA with:
 * - Page view events on every route change
 * - Content group classification
 * - Scroll depth tracking
 * - Engagement time tracking
 */
export function usePageTracking() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    // Determine content group for GA4 reporting
    const contentGroup = getContentGroup(location.pathname);

    // Send page view to GA4 with enhanced data
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
        content_group: contentGroup,
      });
    }
  }, [location.pathname]);

  // Scroll depth tracking (once per page)
  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const thresholds = [25, 50, 75, 90];
    const fired = new Set<number>();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          window.gtag!("event", "scroll_depth", {
            percent_scrolled: threshold,
            page_path: location.pathname,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);
}

function getContentGroup(path: string): string {
  if (path === "/") return "Homepage";
  if (path === "/dashboard") return "Dashboard";
  if (path.startsWith("/price-prediction")) return "Price Predictions";
  if (path.startsWith("/predictions")) return "Prediction Hub";
  if (path.startsWith("/sentiment")) return "Sentiment";
  if (path.startsWith("/explorer")) return "Explorer";
  if (path.startsWith("/chain/")) return "Chain Analytics";
  if (path.startsWith("/market/")) return "Market Questions";
  if (path.startsWith("/markets/")) return "Coin Markets";
  if (path.startsWith("/q/")) return "Question Intent";
  if (path.startsWith("/learn")) return "Education";
  if (path.startsWith("/insights")) return "Insights";
  if (path.startsWith("/strength")) return "Strength Meter";
  if (path.startsWith("/factory")) return "Crypto Factory";
  if (path.startsWith("/portfolio")) return "Portfolio";
  if (path === "/about" || path === "/contact") return "Company";
  if (path === "/privacy-policy" || path === "/terms" || path === "/risk-disclaimer") return "Legal";
  return "Other";
}

/**
 * Initialize AdSense safely
 */
export function initializeAdSense() {
  if (typeof window === "undefined") return;
  window.adsbygoogle = window.adsbygoogle || [];
}
