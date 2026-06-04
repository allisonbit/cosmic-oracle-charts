import React from "react";
import { RefreshCw, Home, ChevronLeft } from "lucide-react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; isChunkError: boolean; retried: boolean };

const CHUNK_RE = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i;

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, isChunkError: false, retried: false };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const msg = (error as any)?.message || String(error);
    return { hasError: true, isChunkError: CHUNK_RE.test(msg) };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[RouteErrorBoundary]", error, info?.componentStack);

    // Auto-recover chunk load errors exactly once (stale deploy cache)
    const msg = (error as any)?.message || "";
    if (CHUNK_RE.test(msg) && !this.state.retried) {
      this.setState({ retried: true });
      try { sessionStorage.removeItem("__oracle_chunk_recover_v1"); } catch { /* noop */ }
      setTimeout(() => window.location.reload(), 300);
    }
  }

  private retry = () => {
    this.setState({ hasError: false, isChunkError: false, retried: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 text-center space-y-4 shadow-xl">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-warning" />
          </div>

          <div>
            <h2 className="font-display font-bold text-base text-foreground">
              {this.state.isChunkError ? "Updating…" : "Page failed to load"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {this.state.isChunkError
                ? "A new version was deployed. Reloading to apply updates."
                : "This section hit an error. The rest of the site is fine."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.retry}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Go back
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/** Lightweight boundary for individual dashboard widgets — shows a subtle placeholder instead of crashing the page */
export class WidgetErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[WidgetErrorBoundary] widget crashed:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="holo-card p-4 flex items-center justify-center min-h-[80px] text-xs text-muted-foreground gap-2">
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Widget unavailable — <button className="underline text-primary" onClick={() => this.setState({ hasError: false })}>retry</button></span>
      </div>
    );
  }
}
