import { Brain, TrendingUp, Users, Target } from "lucide-react";

export function AirdropStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display">$4.2B</div>
          <div className="text-xs text-muted-foreground mt-1">Est. Value Tracked</div>
        </div>
      </div>
      
      <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-success/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display">24</div>
          <div className="text-xs text-muted-foreground mt-1">Active Opportunities</div>
        </div>
      </div>
      
      <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Users className="w-5 h-5 text-warning" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display">1.2M+</div>
          <div className="text-xs text-muted-foreground mt-1">Farmers Tracked</div>
        </div>
      </div>
      
      <div className="bg-background/50 border border-border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-display">94%</div>
          <div className="text-xs text-muted-foreground mt-1">AI Prediction Accuracy</div>
        </div>
      </div>
    </div>
  );
}
