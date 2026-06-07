import { useQuery } from "@tanstack/react-query";
import { resolveCoin, ResolvedCoin } from "@/lib/resolveCoin";

// ── useResolvedCoin ───────────────────────────────────────────────────────────
// React Query wrapper around resolveCoin() so the prediction page can accept any
// identifier (slug / symbol / contract / mint) and get a stable, cached coin.
// When `predefined` is supplied (a known top coin) it resolves instantly with no
// network call.

export function useResolvedCoin(
  identifier: string | undefined,
  predefined?: { id: string; symbol: string; name: string } | null,
) {
  return useQuery<ResolvedCoin>({
    queryKey: ["resolve-coin", identifier, predefined?.id ?? null],
    queryFn: () => resolveCoin(identifier || "bitcoin", predefined),
    enabled: !!identifier,
    staleTime: 10 * 60_000,   // identity rarely changes
    gcTime: 30 * 60_000,
    retry: 1,
  });
}
