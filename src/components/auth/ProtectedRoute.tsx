import { useAccount, useConnect } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { LogIn, Shield, Sparkles, TrendingUp, Bell, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { loading: authLoading } = useAuth();

  const handleSignIn = async () => {
    try {
      const connector = connectors.find(c => c.id === 'walletConnect' || c.id === 'injected') || connectors[0];
      if (connector) connect({ connector });
    } catch (e) {
      console.error("Connect error:", e);
    }
  };

  if (authLoading && !isConnected) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">Sign In to Unlock</h1>
              <p className="text-muted-foreground text-lg">
                Get access to your personal crypto command center
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { icon: TrendingUp, label: "Portfolio Tracker", desc: "Track all your holdings" },
                { icon: Bell, label: "Price Alerts", desc: "Never miss a move" },
                { icon: MessageCircle, label: "AI Assistant", desc: "Ask Oracle Bull anything" },
                { icon: Sparkles, label: "Watchlist", desc: "Save your favorites" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                  <f.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleSignIn}
              disabled={isPending}
              className="w-full gap-3 text-base h-12"
            >
              <LogIn className="w-5 h-5" />
              {isPending ? "Connecting..." : "Connect Wallet"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
