import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

export function CryptoChart({ price, isPositive, symbol }: { price: number; isPositive: boolean; symbol?: string }) {
  const { data: points } = useQuery({
    queryKey: ["sparkline", symbol ?? "BTC"],
    queryFn: async () => {
      const { data, error } = await invokeFunction("sparkline", {
        body: { symbol: symbol ?? "BTC", days: 1 },
      });
      if (error) throw error;
      return (data?.points ?? []) as Array<{ time: string; price: number }>;
    },
    enabled: !!symbol,
    refetchInterval: 120_000,
    refetchIntervalInBackground: true,
    staleTime: 60_000,
  });

  const data = (points ?? []).length > 0
    ? points!.map((p, i) => ({ time: `${i}`, price: p.price }))
    : [];

  if (data.length === 0) {
    return <div className="h-[80px] bg-muted/20 rounded animate-pulse" />;
  }

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
        <Tooltip
          contentStyle={{
            background: "hsl(230, 30%, 8%)",
            border: "1px solid hsl(190, 100%, 50%, 0.3)",
            borderRadius: "8px",
            color: "hsl(200, 100%, 95%)",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
          strokeWidth={2}
          fill={isPositive ? "url(#colorPositive)" : "url(#colorNegative)"}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
