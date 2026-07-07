import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    adsbygoogle: any[];
  }
}

export function AdRefresh() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Send GA4 pageview on every SPA navigation
    if (window.gtag) {
      window.gtag("config", "G-LTB2T64QVN", {
        page_path: pathname,
      });
    }

    // Re-trigger AdSense
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch {
      // AdSense not ready yet
    }
  }, [pathname]);

  return null;
}
