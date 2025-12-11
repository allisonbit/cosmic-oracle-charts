import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface TokenHolding {
  symbol: string;
  name: string;
  value: number;
  riskLevel: "low" | "medium" | "high" | "extreme";
}

interface HoldingsDistributionProps {
  holdings: TokenHolding[];
  totalValue: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(210, 70%, 60%)',
  'hsl(270, 70%, 60%)',
  'hsl(330, 70%, 60%)',
];

export function HoldingsDistribution({ holdings, totalValue }: HoldingsDistributionProps) {
  const pieData = holdings
    .filter(h => h.value > 0)
    .slice(0, 8)
    .map((h, i) => ({
      name: h.symbol,
      value: h.value,
      percentage: totalValue > 0 ? (h.value / totalValue * 100).toFixed(1) : 0,
      color: COLORS[i % COLORS.length]
    }));

  // Add "Others" if there are more holdings
  if (holdings.length > 8) {
    const othersValue = holdings.slice(8).reduce((sum, h) => sum + h.value, 0);
    if (othersValue > 0) {
      pieData.push({
        name: 'Others',
        value: othersValue,
        percentage: totalValue > 0 ? (othersValue / totalValue * 100).toFixed(1) : 0,
        color: 'hsl(var(--muted-foreground))'
      });
    }
  }

  // Calculate risk distribution
  const riskDistribution = {
    low: holdings.filter(h => h.riskLevel === 'low').reduce((sum, h) => sum + h.value, 0),
    medium: holdings.filter(h => h.riskLevel === 'medium').reduce((sum, h) => sum + h.value, 0),
    high: holdings.filter(h => h.riskLevel === 'high').reduce((sum, h) => sum + h.value, 0),
    extreme: holdings.filter(h => h.riskLevel === 'extreme').reduce((sum, h) => sum + h.value, 0),
  };

  const riskData = [
    { name: 'Low Risk', value: riskDistribution.low, color: 'hsl(var(--success))' },
    { name: 'Medium Risk', value: riskDistribution.medium, color: 'hsl(var(--warning))' },
    { name: 'High Risk', value: riskDistribution.high, color: 'hsl(var(--danger))' },
    { name: 'Extreme Risk', value: riskDistribution.extreme, color: 'hsl(0, 90%, 50%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Holdings Distribution */}
      <div className="holo-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">Holdings Distribution</h3>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {pieData.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
            ))}
            {pieData.length > 5 && (
              <div className="text-xs text-muted-foreground">
                +{pieData.length - 5} more tokens
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="holo-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">Risk Distribution</h3>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {riskData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Safe Assets</span>
            <span className={cn(
              "font-medium",
              riskDistribution.low > riskDistribution.high + riskDistribution.extreme ? "text-success" : "text-warning"
            )}>
              {totalValue > 0 ? ((riskDistribution.low / totalValue) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">High Risk Assets</span>
            <span className={cn(
              "font-medium",
              (riskDistribution.high + riskDistribution.extreme) / totalValue > 0.5 ? "text-danger" : "text-muted-foreground"
            )}>
              {totalValue > 0 ? (((riskDistribution.high + riskDistribution.extreme) / totalValue) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
