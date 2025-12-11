import { PieChart } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";

export function DominanceChart() {
  const { data } = useMarketData();
  const global = data?.global;

  const dominanceData = [
    { name: "BTC", value: global?.btcDominance || 55, color: "hsl(38, 92%, 50%)" },
    { name: "ETH", value: global?.ethDominance || 18, color: "hsl(230, 60%, 50%)" },
    { name: "Others", value: 100 - (global?.btcDominance || 55) - (global?.ethDominance || 18), color: "hsl(190, 100%, 50%)" },
  ];

  // Calculate cumulative angles for the pie chart
  let cumulativePercent = 0;
  const segments = dominanceData.map(item => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.value;
    return {
      ...item,
      startAngle: startPercent * 3.6,
      endAngle: cumulativePercent * 3.6,
    };
  });

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-2">
        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        MARKET DOMINANCE
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Simple CSS pie chart */}
        <div 
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full relative flex-shrink-0"
          style={{
            background: `conic-gradient(
              ${dominanceData[0].color} 0deg ${segments[0].endAngle}deg,
              ${dominanceData[1].color} ${segments[0].endAngle}deg ${segments[1].endAngle}deg,
              ${dominanceData[2].color} ${segments[1].endAngle}deg 360deg
            )`
          }}
        >
          <div className="absolute inset-3 sm:inset-4 rounded-full bg-card flex items-center justify-center">
            <span className="font-display text-[10px] sm:text-xs text-muted-foreground">DOMINANCE</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 sm:space-y-3 flex-1 w-full sm:w-auto">
          {dominanceData.map(item => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                  style={{ background: item.color }}
                />
                <span className="font-display font-bold text-sm sm:text-base">{item.name}</span>
              </div>
              <span className="text-base sm:text-lg font-bold">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
