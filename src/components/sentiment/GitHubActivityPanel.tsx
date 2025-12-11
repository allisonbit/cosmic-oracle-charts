import { 
  Github, GitCommit, GitPullRequest, Star, Users, 
  TrendingUp, TrendingDown, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProjectActivity {
  name: string;
  symbol: string;
  commits7d: number;
  pullRequests: number;
  stars: number;
  contributors: number;
  activityChange: number;
}

const mockProjects: ProjectActivity[] = [
  { name: "Bitcoin Core", symbol: "BTC", commits7d: 45, pullRequests: 12, stars: 78000, contributors: 890, activityChange: 8 },
  { name: "go-ethereum", symbol: "ETH", commits7d: 123, pullRequests: 28, stars: 48000, contributors: 1200, activityChange: 15 },
  { name: "Solana Labs", symbol: "SOL", commits7d: 89, pullRequests: 34, stars: 12500, contributors: 450, activityChange: 22 },
  { name: "Cardano", symbol: "ADA", commits7d: 67, pullRequests: 18, stars: 3800, contributors: 280, activityChange: -5 },
  { name: "Polkadot SDK", symbol: "DOT", commits7d: 156, pullRequests: 42, stars: 8200, contributors: 520, activityChange: 12 },
  { name: "Cosmos SDK", symbol: "ATOM", commits7d: 78, pullRequests: 25, stars: 6100, contributors: 380, activityChange: 6 },
];

export function GitHubActivityPanel() {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const maxCommits = Math.max(...mockProjects.map(p => p.commits7d));

  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
        <Github className="w-5 h-5 text-primary" />
        DEVELOPER ACTIVITY
      </h3>

      <div className="space-y-4">
        {mockProjects.map((project) => (
          <div key={project.symbol} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-primary">{project.symbol}</span>
                <span className="text-sm text-muted-foreground">{project.name}</span>
              </div>
              <span className={cn(
                "text-xs font-bold flex items-center gap-1 px-2 py-1 rounded",
                project.activityChange >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
              )}>
                {project.activityChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {project.activityChange >= 0 ? "+" : ""}{project.activityChange}%
              </span>
            </div>

            {/* Commits Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  Commits (7d)
                </span>
                <span className="font-medium text-foreground">{project.commits7d}</span>
              </div>
              <Progress value={(project.commits7d / maxCommits) * 100} className="h-1.5" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-muted/50">
                <GitPullRequest className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs font-bold">{project.pullRequests}</div>
                <div className="text-[10px] text-muted-foreground">PRs</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <Star className="w-3 h-3 mx-auto mb-1 text-warning" />
                <div className="text-xs font-bold">{formatNumber(project.stars)}</div>
                <div className="text-[10px] text-muted-foreground">Stars</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <Users className="w-3 h-3 mx-auto mb-1 text-primary" />
                <div className="text-xs font-bold">{project.contributors}</div>
                <div className="text-[10px] text-muted-foreground">Devs</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-display text-primary">DEV INSIGHT</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ethereum and Polkadot showing highest development activity. 
          Solana commits up <span className="text-success font-medium">22%</span> week-over-week.
        </p>
      </div>
    </div>
  );
}
