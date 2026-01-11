import { BarChart3, TrendingUp, Target, CheckCircle, XCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PerformanceData {
  timeframe: string;
  accuracy: number;
  avgReturn: number;
  totalPredictions: number;
  correctPredictions: number;
}

export function PerformanceTracker() {
  // In production, this would come from an API tracking actual prediction outcomes
  const performanceData: PerformanceData[] = [
    { timeframe: 'Daily', accuracy: 72.4, avgReturn: 2.1, totalPredictions: 1250, correctPredictions: 905 },
    { timeframe: 'Weekly', accuracy: 65.8, avgReturn: 5.7, totalPredictions: 420, correctPredictions: 276 },
    { timeframe: 'Monthly', accuracy: 58.3, avgReturn: 12.4, totalPredictions: 180, correctPredictions: 105 },
  ];

  const overallAccuracy = performanceData.reduce((acc, d) => acc + d.accuracy, 0) / performanceData.length;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-500/20';
    if (accuracy >= 55) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="holo-card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">Prediction Performance</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Last 30 Days
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Historical accuracy of our AI predictions (direction correct within forecast period)
      </p>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div className={cn("text-xl font-bold", getAccuracyColor(overallAccuracy))}>
            {overallAccuracy.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground">Overall Accuracy</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-bold text-green-400">
            {performanceData.reduce((acc, d) => acc + d.correctPredictions, 0)}
          </div>
          <div className="text-[10px] text-muted-foreground">Correct Calls</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold">
            {performanceData.reduce((acc, d) => acc + d.totalPredictions, 0)}
          </div>
          <div className="text-[10px] text-muted-foreground">Total Predictions</div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Timeframe</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Accuracy</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Avg Return</th>
              <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Correct/Total</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((data) => (
              <tr key={data.timeframe} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{data.timeframe}</div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className={cn("h-2 rounded-full", getAccuracyBg(data.accuracy))} style={{ width: `${data.accuracy}px` }} />
                    <span className={cn("font-bold", getAccuracyColor(data.accuracy))}>
                      {data.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className="text-green-400 font-medium">+{data.avgReturn}%</span>
                </td>
                <td className="p-3 text-right hidden sm:table-cell">
                  <span className="text-muted-foreground">
                    {data.correctPredictions}/{data.totalPredictions}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-[10px] text-muted-foreground/60 text-center">
        Past performance does not guarantee future results. Accuracy measured as direction correct within forecast period.
      </p>
    </div>
  );
}
