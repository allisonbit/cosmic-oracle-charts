import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Mark successful mount for the HTML boot fallback (prevents "blank screen" confusion)
queueMicrotask(() => {
  try {
    (window as any).__oracleBoot?.markMounted?.();
  } catch {
    // ignore
  }
});
