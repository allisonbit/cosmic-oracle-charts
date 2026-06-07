import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// `trade_setups` is newer than the generated Supabase types, so we access it via
// an untyped client handle to avoid type friction until types are regenerated.
const db = supabase as any;

export interface TradeSetup {
  id: string;
  scope: "global" | "user";
  user_id: string | null;
  coin_id: string;
  symbol: string;
  name: string;
  contract_address: string | null;
  chain: string | null;
  image: string | null;
  timeframe: string;
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  entry_price: number;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  take_profit_3: number;
  status: "active" | "hit_tp1" | "hit_tp2" | "hit_tp3" | "stopped" | "invalidated" | "expired";
  last_price: number;
  peak_price: number;
  pnl_percent: number;
  hit_targets: number;
  resolved_at: string | null;
  expires_at: string | null;
  write_up: string | null;
  seo_slug: string | null;
  generated_at: string;
  updated_at: string;
}

/** The current active global setup for a coin/timeframe (the one shown on the page). */
export function useActiveSetup(coinId: string | undefined, timeframe: string) {
  return useQuery<TradeSetup | null>({
    queryKey: ["trade-setup", coinId, timeframe],
    queryFn: async () => {
      if (!coinId) return null;
      try {
        const { data, error } = await db
          .from("trade_setups")
          .select("*")
          .eq("coin_id", coinId)
          .eq("timeframe", timeframe)
          .eq("scope", "global")
          .eq("status", "active")
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return null; // table may not be deployed yet — degrade gracefully
        return data as TradeSetup | null;
      } catch {
        return null;
      }
    },
    enabled: !!coinId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Resolved setup history for a coin → powers the honest track record. */
export function useSetupHistory(coinId: string | undefined, limit = 20) {
  return useQuery<TradeSetup[]>({
    queryKey: ["trade-setup-history", coinId, limit],
    queryFn: async () => {
      if (!coinId) return [];
      try {
        const { data, error } = await db
          .from("trade_setups")
          .select("*")
          .eq("coin_id", coinId)
          .eq("scope", "global")
          .not("resolved_at", "is", null)
          .order("resolved_at", { ascending: false })
          .limit(limit);
        if (error) return [];
        return (data ?? []) as TradeSetup[];
      } catch {
        return [];
      }
    },
    enabled: !!coinId,
    staleTime: 5 * 60_000,
  });
}

/** Save / follow a global setup into the signed-in user's account. */
export function useSaveSetup() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (setup: TradeSetup) => {
      if (!user?.id) throw new Error("not-authenticated");
      const { id, generated_at, updated_at, user_id, scope, ...rest } = setup;
      const { error } = await db.from("trade_setups").insert({
        ...rest,
        scope: "user",
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Setup saved to your account");
      qc.invalidateQueries({ queryKey: ["my-setups"] });
    },
    onError: (e: any) => {
      if (e?.message === "not-authenticated") toast.error("Sign in to save setups");
      else toast.error("Could not save setup");
    },
  });
}

/** The signed-in user's saved setups. */
export function useMySetups() {
  const { user } = useAuth();
  return useQuery<TradeSetup[]>({
    queryKey: ["my-setups", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data, error } = await db
          .from("trade_setups")
          .select("*")
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false });
        if (error) return [];
        return (data ?? []) as TradeSetup[];
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}
