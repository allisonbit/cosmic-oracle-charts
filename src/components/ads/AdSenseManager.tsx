import { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global AdSense manager component
 * - Ensures single initialization of AdSense
 * - Handles Auto Ads properly
 * - Refreshes ads on route changes for SPAs
 */
export const AdSenseManager = memo(function AdSenseManager() {
  const location = useLocation();

  // Initialize AdSense array on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Ensure adsbygoogle array exists
    const w = window as { adsbygoogle?: unknown[] };
    w.adsbygoogle = w.adsbygoogle || [];
  }, []);

  // Handle route changes - trigger Auto Ads refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Small delay to allow DOM to settle after route change
    const timer = setTimeout(() => {
      try {
        // Trigger Auto Ads to scan for new placements
        const w = window as { 
          adsbygoogle?: { push: (p: object) => void }[];
          __autoAdsRefreshed?: string;
        };
        
        // Only refresh if path actually changed
        if (w.__autoAdsRefreshed !== location.pathname) {
          w.__autoAdsRefreshed = location.pathname;
          
          // Dispatch a custom event that Auto Ads listens to
          window.dispatchEvent(new Event("resize"));
        }
      } catch {
        // Silently fail - ads are non-critical
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
});

export default AdSenseManager;
