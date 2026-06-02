import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { formatPrice, formatCompact } from "@/lib/formatters";

interface TokenChartTabProps {
  chartData: any[];
  chartTimeframe: '1h' | '24h' | '7d' | '30d';
  setChartTimeframe: (tf: '1h' | '24h' | '7d' | '30d') => void;
  isPositive: boolean;
}

export function TokenChartTab({ chartData, chartTimeframe, setChartTimeframe, isPositive }: TokenChartTabProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Price Chart</CardTitle>
        <div className="flex gap-1">
          {(['1h', '24h', '7d', '30d'] as const).map(tf => (
            <Button key={tf} variant={chartTimeframe === tf ? 'default' : 'ghost'} size="sm"
              className="text-xs h-7 px-2" onClick={() => setChartTimeframe(tf)}>
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']}
                tickFormatter={(v: number) => formatPrice(v)} width={80} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v: number) => [formatPrice(v), 'Price']}
              />
              <Area type="monotone" dataKey="price" stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))'} fill="url(#priceGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[80px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="time" tick={false} />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={80}
                tickFormatter={(v: number) => formatCompact(v)} />
              <Bar dataKey="volume" fill="hsl(var(--primary) / 0.3)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
