import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — scrolls to the top of the page on every route change.
 * Fixes the issue where navigating to a new page keeps the scroll position
 * from the previous page.
 * Also moves keyboard/screen-reader focus to the main landmark so SPA
 * navigation behaves like a full page load for assistive tech.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Skip focus stealing on initial load — only manage focus on SPA navigation.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const main = document.getElementById("main-content");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  return null;
}
