import { Brain, CheckCircle2, AlertTriangle, Coins, Zap, Shield, HelpCircle, Activity } from "lucide-react";
import { type AirdropProject } from "./AirdropList";
import { cn } from "@/lib/utils";

export function AirdropCard({ project }: { project: AirdropProject }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "text-success border-success/30 bg-success/10";
      case "Rumored": return "text-warning border-warning/30 bg-warning/10";
      case "Snapshot Taken": return "text-danger border-danger/30 bg-danger/10";
      default: return "text-muted-foreground border-border bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "Rumored": return <HelpCircle className="w-3.5 h-3.5" />;
      case "Snapshot Taken": return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="holo-card p-5 md:p-6 group flex flex-col h-full relative overflow-hidden">
      {/* AI Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 p-2 flex items-center justify-center border border-border">
            <img src={project.logo} alt={project.name} className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl text-foreground flex items-center gap-2">
              {project.name}
              <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                {project.ticker}
              </span>
            </h3>
            <p className="text-xs text-primary font-medium tracking-wide">{project.category}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(project.status))}>
          {getStatusIcon(project.status)}
          <span>{project.status}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{project.description}</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 relative z-10">
        <div className="bg-background/50 border border-border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wider flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-primary" /> AI SCORE
          </div>
          <div className="font-display font-bold text-lg text-foreground">{project.aiScore}/100</div>
        </div>
        <div className="bg-background/50 border border-border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wider flex items-center gap-1.5">
            <Coins className="w-3 h-3 text-success" /> EST. VALUE
          </div>
          <div className="font-bold text-sm text-foreground mt-1">{project.estValue}</div>
        </div>
        <div className="bg-background/50 border border-border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wider flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-warning" /> DIFFICULTY
          </div>
          <div className={cn(
            "font-bold text-sm mt-1",
            project.difficulty === "Easy" ? "text-success" : project.difficulty === "Medium" ? "text-warning" : "text-danger"
          )}>
            {project.difficulty}
          </div>
        </div>
        <div className="bg-background/50 border border-border rounded-lg p-3">
          <div className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wider flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-purple-500" /> FUNDING
          </div>
          <div className="font-bold text-sm text-foreground mt-1">{project.funding}</div>
        </div>
      </div>

      {/* AI Analysis Box */}
      <div className="mt-auto bg-primary/5 border border-primary/20 rounded-xl p-4 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary fill-primary/20" />
          <span className="text-xs font-bold text-foreground">Oracle AI Analysis</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {project.aiAnalysis}
        </p>
        
        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Required Actions to Qualify:</div>
          <div className="flex flex-wrap gap-2">
            {project.tasks.map((task, idx) => (
              <span key={idx} className="text-[10px] md:text-xs bg-background/80 border border-border px-2 py-1 rounded-md text-foreground/80">
                {task}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
