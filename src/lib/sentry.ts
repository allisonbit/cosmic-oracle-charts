import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking for production.
 * 
 * To activate, set VITE_SENTRY_DSN in your environment variables
 * (Cloudflare Pages / .env). Get your DSN from https://sentry.io
 * 
 * Until a DSN is set, Sentry is disabled and has zero runtime cost.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return; // No DSN = Sentry disabled (dev / missing config)

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Only send errors in production
    enabled: import.meta.env.PROD,
    // Sample 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Sample 10% of sessions for replay (helps debug UI issues)
    replaysSessionSampleRate: 0.1,
    // Always capture sessions with errors
    replaysOnErrorSampleRate: 1.0,
    // Filter noisy errors
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop",
      "ResizeObserver loop limit exceeded",
      // Ad blockers
      "adsbygoogle",
      "googlesyndication",
      // Network errors (expected on flaky mobile connections)
      "TypeError: Failed to fetch",
      "TypeError: NetworkError",
      "TypeError: Load failed",
      "ChunkLoadError",
      // Wallet errors (user-initiated)
      "User rejected the request",
      "User denied transaction",
    ],
    // Don't send PII
    sendDefaultPii: false,
    beforeSend(event) {
      // Strip any wallet addresses or tokens from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(bc => {
          if (bc.message) {
            bc.message = bc.message.replace(/0x[a-fA-F0-9]{40}/g, "0x[REDACTED]");
          }
          return bc;
        });
      }
      return event;
    },
  });
}

// Re-export Sentry's ErrorBoundary for use in components
export const SentryErrorBoundary = Sentry.ErrorBoundary;
