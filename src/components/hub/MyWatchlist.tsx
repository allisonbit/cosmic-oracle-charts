import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Plus, Trash2, TrendingUp, TrendingDown, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MyWatchlist() {
  const { user, profile, refreshProfile } = useAuth();
  const { data: prices, isLoading: pricesLoading } = useCryptoPrices();
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const watchlist: string[] = profile?.watchlist || [];

  const updateWatchlist = useCallback(async (newList: string[]) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ watchlist: newList as any })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Watchlist updated");
    } catch (e) {
      toast.error("Failed to update watchlist");
    } finally {
      setSaving(false);
    }
  }, [user, refreshProfile]);

  const addCoin = (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (!watchlist.includes(upper)) {
      updateWatchlist([...watchlist, upper]);
    }
  };

  const removeCoin = (symbol: string) => {
    updateWatchlist(watchlist.filter(s => s !== symbol));
  };

  const allCoins = prices ? Object.entries(prices).map(([id, data]: [string, any]) => ({
    id,
    symbol: data.symbol?.toUpperCase() || id.toUpperCase(),
    name: data.name || id,
    price: data.current_price || data.usd || 0,
    change24h: data.price_change_percentage_24h || 0,
  })) : [];

  const watchedCoins = allCoins.filter(c => watchlist.includes(c.symbol));
  const searchResults = search.length >= 2
    ? allCoins.filter(c =>
        !watchlist.includes(c.symbol) &&
        (c.symbol.includes(search.toUpperCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 8)
    : [];

  return (
    <div className="space-y-6">
      {/* Add coins */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search coins to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
            {searchResults.map(coin => (
              <button
                key={coin.id}
                onClick={() => { addCoin(coin.symbol); setSearch(""); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{coin.symbol}</span>
                  <span className="text-sm text-muted-foreground">{coin.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">${coin.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your watchlist is empty</h3>
            <p className="text-muted-foreground">Search and add coins you want to track</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {watchedCoins.map(coin => (
            <Link
              key={coin.id}
              to={`/price-prediction/${coin.id}`}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Star className="w-5 h-5 text-warning fill-warning" />
                <div>
                  <span className="font-bold text-foreground">{coin.symbol}</span>
                  <span className="text-sm text-muted-foreground ml-2">{coin.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-foreground">
                  ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  coin.change24h >= 0 ? "text-success" : "text-destructive"
                )}>
                  {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(coin.change24h).toFixed(2)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => { e.preventDefault(); removeCoin(coin.symbol); }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {saving && (
        <div className="flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
