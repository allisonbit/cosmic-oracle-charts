import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep console logging for debugging; avoid crashing to blank screen.
    console.error("App crashed:", error);
  }

  private handleReload = () => {
    try {
      // If this was caused by stale chunk cache, clearing this prevents reload loops.
      sessionStorage.removeItem("__oracle_chunk_recover_v1");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-border/30 bg-card/40 backdrop-blur p-6 text-center">
          <h1 className="font-display text-xl text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The app failed to load on this device. Reloading usually fixes it.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button variant="cosmic" onClick={this.handleReload}>Reload</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}
