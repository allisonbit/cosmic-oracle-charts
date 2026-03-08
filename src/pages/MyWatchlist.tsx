import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MyWatchlist } from "@/components/hub/MyWatchlist";
import { Star } from "lucide-react";

function WatchlistContent() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
            <p className="text-sm text-muted-foreground">Track your favorite coins in real-time</p>
          </div>
        </div>
        <MyWatchlist />
      </div>
    </Layout>
  );
}

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistContent />
    </ProtectedRoute>
  );
}
