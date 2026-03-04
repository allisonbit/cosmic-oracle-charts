import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Mark mounted BEFORE render to prevent race condition with API error handlers
try {
  (window as any).__oracleBoot?.markMounted?.();
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
