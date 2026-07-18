import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * On the FIRST time an authenticated wallet session is detected in this browser,
 * redirect to /welcome. Uses localStorage flag so it fires exactly once.
 */
export function FirstConnectRedirect() {
  const { authenticated, ready } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!ready || !authenticated) return;
    try {
      if (localStorage.getItem("ob_welcomed_at")) return;
    } catch {
      return;
    }
    // Don't hijack embed / admin / welcome itself
    if (pathname.startsWith("/embed") || pathname.startsWith("/admin") || pathname.startsWith("/welcome")) return;
    localStorage.setItem("ob_welcomed_at", new Date().toISOString());
    navigate("/welcome", { replace: false });
  }, [authenticated, ready, navigate, pathname]);

  return null;
}
