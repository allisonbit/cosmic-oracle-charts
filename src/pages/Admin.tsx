import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, AlertTriangle, CheckCircle, Clock, FileText, 
  Link as LinkIcon, RefreshCw, Search, Shield, TrendingUp, 
  Loader2, XCircle, Globe, Database, Zap, Bot, Play, 
  Eye, Trash2, Send, Settings
} from "lucide-react";
import { useSEOMonitor, useContentRefresh, calculateSEOScore, type SEOReport } from "@/hooks/useSEOMonitor";
import { useAutomationLogs, useContentDrafts, useTriggerAgent, usePublishDraft } from "@/hooks/useAutomation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Content stats hook
function useContentStats() {
  return useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [insightsResult, learnResult, totalResult] = await Promise.all([
        supabase.from('blog_articles').select('id', { count: 'exact' }).eq('source', 'insights'),
        supabase.from('blog_articles').select('id', { count: 'exact' }).eq('source', 'learn'),
        supabase.from('blog_articles').select('id, published_at', { count: 'exact' }),
      ]);
      const todayArticles = totalResult.data?.filter(a => a.published_at?.startsWith(today)).length || 0;
      return {
        insightsCount: insightsResult.count || 0,
        learnCount: learnResult.count || 0,
        totalCount: totalResult.count || 0,
        todayCount: todayArticles,
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}

function ScoreBadge({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (s >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (s >= 50) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };
  return (
    <Badge className={cn("text-2xl font-bold px-4 py-2", getScoreColor(score))}>
      {score}/100
    </Badge>
  );
}

function StatusCard({ title, value, subtitle, icon: Icon, status = "success" }: { 
  title: string; value: string | number; subtitle?: string; icon: React.ElementType; 
  status?: "success" | "warning" | "error" | "info";
}) {
  const statusColors = { success: "text-green-400", warning: "text-yellow-400", error: "text-red-400", info: "text-blue-400" };
  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn("p-2 rounded-lg bg-primary/10", statusColors[status])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: seoReport, isLoading: seoLoading, refetch: refetchSEO, isFetching: seoFetching } = useSEOMonitor();
  const { mutate: refreshContent, isPending: contentRefreshing } = useContentRefresh();
  const { data: contentStats, isLoading: contentLoading } = useContentStats();
  const { data: logs, isLoading: logsLoading } = useAutomationLogs();
  const { data: drafts, isLoading: draftsLoading } = useContentDrafts();
  const { mutate: triggerAgent, isPending: agentRunning } = useTriggerAgent();
  const { mutate: publishDraft, isPending: publishing } = usePublishDraft();

  const seoScore = seoReport ? calculateSEOScore(seoReport) : 0;

  const handleTriggerAgent = (agent: "content" | "restructure" | "full") => {
    toast.info(`Running ${agent} agent...`);
    triggerAgent({ agent }, {
      onSuccess: (data) => toast.success(`${agent} agent completed`, { description: JSON.stringify(data).slice(0, 100) }),
      onError: (err) => toast.error(`Agent failed: ${err.message}`),
    });
  };

  const handlePublish = (id: string) => {
    publishDraft(id, {
      onSuccess: () => toast.success("Draft published successfully"),
      onError: (err) => toast.error(`Publish failed: ${err.message}`),
    });
  };

  const pendingDrafts = drafts?.filter(d => d.status === "draft") || [];
  const publishedDrafts = drafts?.filter(d => d.status === "published") || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Autonomous Growth Engine — Monitor & Control</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchSEO()} disabled={seoFetching} className="border-primary/30">
              {seoFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              SEO Check
            </Button>
            <Button size="sm" onClick={() => refreshContent({ count: 20 })} disabled={contentRefreshing} className="bg-primary/20 hover:bg-primary/30">
              {contentRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Content
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusCard title="SEO Score" value={seoLoading ? "..." : seoScore} subtitle={seoReport ? `${seoReport.healthyPages}/${seoReport.totalPages} healthy` : "Run check"} icon={Shield} status={seoScore >= 80 ? "success" : seoScore >= 60 ? "warning" : "error"} />
          <StatusCard title="Total Articles" value={contentLoading ? "..." : contentStats?.totalCount || 0} subtitle={`${contentStats?.todayCount || 0} today`} icon={FileText} status="info" />
          <StatusCard title="Pending Drafts" value={draftsLoading ? "..." : pendingDrafts.length} subtitle="Awaiting publish" icon={Clock} status={pendingDrafts.length > 5 ? "warning" : "info"} />
          <StatusCard title="Automations" value={logsLoading ? "..." : logs?.length || 0} subtitle="Total runs" icon={Bot} status="success" />
          <StatusCard title="Published" value={draftsLoading ? "..." : publishedDrafts.length} subtitle="By agents" icon={Send} status="success" />
        </div>

        {/* Agent Controls */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-primary" />
              Agent Controls
            </CardTitle>
            <CardDescription>Trigger autonomous agents manually or wait for scheduled runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => handleTriggerAgent("content")} disabled={agentRunning} className="h-auto py-4 flex-col gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300">
                {agentRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                <span className="font-semibold">Content Agent</span>
                <span className="text-xs opacity-70">Generate SEO articles</span>
              </Button>
              <Button onClick={() => handleTriggerAgent("restructure")} disabled={agentRunning} className="h-auto py-4 flex-col gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300">
                {agentRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Settings className="w-6 h-6" />}
                <span className="font-semibold">Restructure Agent</span>
                <span className="text-xs opacity-70">Analyze & optimize site</span>
              </Button>
              <Button onClick={() => handleTriggerAgent("full")} disabled={agentRunning} className="h-auto py-4 flex-col gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300">
                {agentRunning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                <span className="font-semibold">Full Pipeline</span>
                <span className="text-xs opacity-70">Content + Restructure</span>
              </Button>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <strong>Webhook URLs</strong> (use with n8n or cron-job.org):
              </p>
              <code className="text-xs text-primary/80 block mt-1 break-all">POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-content</code>
              <code className="text-xs text-primary/80 block mt-1 break-all">POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-restructure</code>
              <code className="text-xs text-primary/80 block mt-1 break-all">POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/trigger-full</code>
              <p className="text-xs text-muted-foreground mt-2">Header: <code>x-api-key: YOUR_WEBHOOK_API_KEY</code></p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-background/50 border border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({pendingDrafts.length})</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><Shield className="w-5 h-5 text-primary" />SEO Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seoReport ? (
                    <>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Overall Score</span><ScoreBadge score={seoScore} /></div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Healthy Pages</span><span className="text-green-400">{seoReport.healthyPages}</span></div>
                        <div className="flex justify-between text-sm"><span>Issues</span><span className="text-red-400">{seoReport.pagesWithIssues}</span></div>
                        <div className="flex justify-between text-sm"><span>Broken Links</span><span className={seoReport.brokenLinks.length > 0 ? "text-red-400" : "text-green-400"}>{seoReport.brokenLinks.length}</span></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground"><Search className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Run an SEO check</p></div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5 text-primary" />Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {logs && logs.length > 0 ? (
                      <div className="space-y-2">
                        {logs.slice(0, 10).map(log => (
                          <div key={log.id} className="flex items-center gap-2 p-2 rounded bg-background/50 text-sm">
                            {log.status === "success" ? <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> : log.status === "error" ? <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" /> : <Loader2 className="w-3 h-3 text-yellow-400 animate-spin flex-shrink-0" />}
                            <span className="truncate flex-1">{log.action}</span>
                            <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No activity yet</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {seoReport && seoReport.recommendations.length > 0 && (
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="w-5 h-5 text-yellow-400" />Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <ul className="space-y-2">
                      {seoReport.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-background/50">
                          {rec.includes('CRITICAL') ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> : rec.includes('✅') ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />}
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Content Drafts</CardTitle>
                <CardDescription>AI-generated content awaiting review and publishing</CardDescription>
              </CardHeader>
              <CardContent>
                {draftsLoading ? (
                  <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                ) : pendingDrafts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending drafts. Run the Content Agent to generate some.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {pendingDrafts.map(draft => (
                        <div key={draft.id} className="p-4 rounded-lg bg-background/50 border border-primary/10">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{draft.title}</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-[10px]">{draft.category}</Badge>
                                <Badge variant="outline" className="text-[10px]">{draft.agent_type}</Badge>
                                {draft.ai_model && <Badge variant="outline" className="text-[10px]">{draft.ai_model}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(draft.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-8 text-green-400 border-green-500/30 hover:bg-green-500/20" onClick={() => handlePublish(draft.id)} disabled={publishing}>
                                <Send className="w-3 h-3 mr-1" />Publish
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Automation Logs</CardTitle>
                <CardDescription>Complete history of agent actions</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                ) : !logs || logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No automation logs yet</p></div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {logs.map(log => (
                        <div key={log.id} className={cn("p-3 rounded-lg border text-sm", log.status === "error" ? "bg-red-500/5 border-red-500/20" : log.status === "running" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-background/50 border-primary/10")}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {log.status === "success" ? <CheckCircle className="w-4 h-4 text-green-400" /> : log.status === "error" ? <XCircle className="w-4 h-4 text-red-400" /> : <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />}
                              <span className="font-medium">{log.action}</span>
                              <Badge variant="outline" className="text-[10px]">{log.agent_type}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          {log.duration_ms && <span className="text-xs text-muted-foreground">Duration: {(log.duration_ms / 1000).toFixed(1)}s</span>}
                          {log.error_message && <p className="text-xs text-red-400 mt-1">{log.error_message}</p>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />Page Health Details</CardTitle>
              </CardHeader>
              <CardContent>
                {seoReport ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {seoReport.results.map((result, i) => (
                        <div key={i} className="p-3 rounded-lg bg-background/50 border border-primary/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.issues.length === 0 ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary">{result.url.replace('https://oraclebull.com', '')}</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={result.status === 200 ? "border-green-400/30 text-green-400" : "border-red-400/30 text-red-400"}>{result.status}</Badge>
                              <span className="text-xs text-muted-foreground">{result.responseTime}ms</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {result.hasTitle && <Badge className="text-[10px] bg-green-500/20 text-green-400">Title</Badge>}
                            {result.hasDescription && <Badge className="text-[10px] bg-green-500/20 text-green-400">Meta</Badge>}
                            {result.hasH1 && <Badge className="text-[10px] bg-green-500/20 text-green-400">H1</Badge>}
                            {result.hasCanonical && <Badge className="text-[10px] bg-green-500/20 text-green-400">Canonical</Badge>}
                            {result.hasSchema && <Badge className="text-[10px] bg-green-500/20 text-green-400">Schema</Badge>}
                            {!result.hasTitle && <Badge className="text-[10px] bg-red-500/20 text-red-400">No Title</Badge>}
                            {!result.hasDescription && <Badge className="text-[10px] bg-red-500/20 text-red-400">No Meta</Badge>}
                          </div>
                          {result.issues.length > 0 && <div className="text-xs text-red-400 mt-1">Issues: {result.issues.join(', ')}</div>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30" /><p className="text-lg mb-2">No SEO data</p>
                    <Button onClick={() => refetchSEO()} disabled={seoFetching}>{seoFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}Run SEO Check</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {seoReport && seoReport.brokenLinks.length > 0 && (
              <Card className="glass-card border-red-500/20">
                <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><LinkIcon className="w-5 h-5" />Broken Links ({seoReport.brokenLinks.length})</CardTitle></CardHeader>
                <CardContent><ul className="space-y-2">{seoReport.brokenLinks.map((link, i) => (<li key={i} className="text-sm flex items-center gap-2 text-red-400"><XCircle className="w-4 h-4" />{link}</li>))}</ul></CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Insights Engine</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="text-xl font-bold">{contentStats?.insightsCount || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-sm">Running</span></div></div>
                </CardContent>
              </Card>
              <Card className="glass-card border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" />Learn Engine</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="text-xl font-bold">{contentStats?.learnCount || 0}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-sm">Running</span></div></div>
                </CardContent>
              </Card>
            </div>
            <Card className="glass-card border-primary/20">
              <CardHeader><CardTitle>Content Growth</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Today's Articles</span><span>{contentStats?.todayCount || 0} / 40</span></div>
                    <Progress value={((contentStats?.todayCount || 0) / 40) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center"><p className="text-2xl font-bold">{contentStats?.totalCount || 0}</p><p className="text-xs text-muted-foreground">Total</p></div>
                    <div className="text-center"><p className="text-2xl font-bold">40</p><p className="text-xs text-muted-foreground">Daily Target</p></div>
                    <div className="text-center"><p className="text-2xl font-bold">6:00</p><p className="text-xs text-muted-foreground">UTC Refresh</p></div>
                    <div className="text-center"><p className="text-2xl font-bold">∞</p><p className="text-xs text-muted-foreground">Append Only</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Core Web Vitals</CardTitle></CardHeader>
              <CardContent>
                {seoReport ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-primary/10"><p className="text-3xl font-bold">{seoReport.coreWebVitals?.averageResponseTime || 0}ms</p><p className="text-sm text-muted-foreground">Avg Response</p></div>
                    <div className="text-center p-4 rounded-lg bg-green-500/10"><p className="text-3xl font-bold text-green-400">{seoReport.coreWebVitals?.fastPages || 0}</p><p className="text-sm text-muted-foreground">Fast Pages</p></div>
                    <div className="text-center p-4 rounded-lg bg-red-500/10"><p className="text-3xl font-bold text-red-400">{seoReport.coreWebVitals?.slowPages || 0}</p><p className="text-sm text-muted-foreground">Slow Pages</p></div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground"><Activity className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Run SEO check for performance data</p></div>
                )}
              </CardContent>
            </Card>
            {seoReport && seoReport.slowPages.length > 0 && (
              <Card className="glass-card border-yellow-500/20">
                <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-400"><Clock className="w-5 h-5" />Slow Pages ({seoReport.slowPages.length})</CardTitle></CardHeader>
                <CardContent><ul className="space-y-2">{seoReport.slowPages.map((page, i) => (<li key={i} className="text-sm flex items-center gap-2 text-yellow-400"><Clock className="w-4 h-4" />{page}</li>))}</ul></CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-primary/10">
          <p>Last content update: {contentStats?.lastUpdated ? new Date(contentStats.lastUpdated).toLocaleString() : 'Unknown'}{seoReport && ` | Last SEO check: ${new Date(seoReport.timestamp).toLocaleString()}`}</p>
        </div>
      </div>
    </Layout>
  );
}
