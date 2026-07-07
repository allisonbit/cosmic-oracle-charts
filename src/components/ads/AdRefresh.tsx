import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function AdRefresh() {
  const { pathname } = useLocation();

  useEffect(() => {
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
