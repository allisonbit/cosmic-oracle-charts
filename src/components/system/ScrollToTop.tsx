import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — scrolls to the top of the page on every route change.
 * Fixes the issue where navigating to a new page keeps the scroll position
 * from the previous page.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  return null;
}
