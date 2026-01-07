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
 * Hook for SPA page view tracking with Google Analytics 4
 * Sends page_view events on every route change
 */
export function usePageTracking() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip if same path (e.g., query string changes only)
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    // Send page view to GA4
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    // Reset ad budget for new page
    const w = window as { __oracle_ad_budget?: { path: string; used: number } };
    if (w.__oracle_ad_budget) {
      w.__oracle_ad_budget = { path: location.pathname, used: 0 };
    }
  }, [location.pathname]);
}

/**
 * Initialize AdSense safely - prevents duplicate initialization
 */
export function initializeAdSense() {
  if (typeof window === "undefined") return;
  
  // AdSense is already loaded via index.html
  // This function ensures the adsbygoogle array exists
  window.adsbygoogle = window.adsbygoogle || [];
}
