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
  Loader2, XCircle, Globe, Database, Zap
} from "lucide-react";
import { useSEOMonitor, useContentRefresh, calculateSEOScore, type SEOReport } from "@/hooks/useSEOMonitor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

// SEO Score Badge Component
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

// Status Card Component
function StatusCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  status = "success" 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType; 
  status?: "success" | "warning" | "error" | "info";
}) {
  const statusColors = {
    success: "text-green-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    info: "text-blue-400",
  };

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
  const { data: contentStats, isLoading: contentLoading, refetch: refetchContent } = useContentStats();

  const seoScore = seoReport ? calculateSEOScore(seoReport) : 0;

  const runSEOCheck = () => {
    refetchSEO();
  };

  const triggerContentRefresh = () => {
    refreshContent({ count: 20 });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor SEO health, content status, and platform performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runSEOCheck}
              disabled={seoFetching}
              className="border-primary/30"
            >
              {seoFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Run SEO Check
            </Button>
            <Button
              size="sm"
              onClick={triggerContentRefresh}
              disabled={contentRefreshing}
              className="bg-primary/20 hover:bg-primary/30"
            >
              {contentRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Content
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            title="SEO Score"
            value={seoLoading ? "..." : seoScore}
            subtitle={seoReport ? `${seoReport.healthyPages}/${seoReport.totalPages} healthy` : "Run check to see"}
            icon={Shield}
            status={seoScore >= 80 ? "success" : seoScore >= 60 ? "warning" : "error"}
          />
          <StatusCard
            title="Total Articles"
            value={contentLoading ? "..." : contentStats?.totalCount || 0}
            subtitle={`${contentStats?.todayCount || 0} today`}
            icon={FileText}
            status="info"
          />
          <StatusCard
            title="Insights Articles"
            value={contentLoading ? "..." : contentStats?.insightsCount || 0}
            subtitle="Daily news content"
            icon={TrendingUp}
            status="success"
          />
          <StatusCard
            title="Learn Articles"
            value={contentLoading ? "..." : contentStats?.learnCount || 0}
            subtitle="Educational content"
            icon={Database}
            status="success"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-background/50 border border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seo">SEO Health</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* SEO Summary Card */}
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    SEO Health Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seoReport ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overall Score</span>
                        <ScoreBadge score={seoScore} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Healthy Pages</span>
                          <span className="text-green-400">{seoReport.healthyPages}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pages with Issues</span>
                          <span className="text-red-400">{seoReport.pagesWithIssues}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Broken Links</span>
                          <span className={seoReport.brokenLinks.length > 0 ? "text-red-400" : "text-green-400"}>
                            {seoReport.brokenLinks.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Missing Meta</span>
                          <span className={seoReport.missingMeta.length > 0 ? "text-yellow-400" : "text-green-400"}>
                            {seoReport.missingMeta.length}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Run an SEO check to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Status Card */}
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Content Generation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm">Daily Generation</span>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Next Run</span>
                      </div>
                      <span className="text-sm text-muted-foreground">6:00 AM UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Articles/Day</span>
                      </div>
                      <span className="text-sm font-medium">40 (20 + 20)</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground mb-2">Content Distribution</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold">{contentStats?.insightsCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Insights</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold">{contentStats?.learnCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Learn</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            {seoReport && seoReport.recommendations.length > 0 && (
              <Card className="glass-card border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <ul className="space-y-2">
                      {seoReport.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-background/50">
                          {rec.includes('CRITICAL') ? (
                            <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          ) : rec.includes('✅') ? (
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Page Health Details
                </CardTitle>
                <CardDescription>
                  Detailed SEO analysis for each monitored page
                </CardDescription>
              </CardHeader>
              <CardContent>
                {seoReport ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {seoReport.results.map((result, i) => (
                        <div key={i} className="p-3 rounded-lg bg-background/50 border border-primary/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.issues.length === 0 ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                                {result.url.replace('https://oraclebull.com', '')}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={result.status === 200 ? "border-green-400/30 text-green-400" : "border-red-400/30 text-red-400"}>
                                {result.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{result.responseTime}ms</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {result.hasTitle && <Badge className="text-[10px] bg-green-500/20 text-green-400">Title</Badge>}
                            {result.hasDescription && <Badge className="text-[10px] bg-green-500/20 text-green-400">Meta</Badge>}
                            {result.hasH1 && <Badge className="text-[10px] bg-green-500/20 text-green-400">H1</Badge>}
                            {result.hasCanonical && <Badge className="text-[10px] bg-green-500/20 text-green-400">Canonical</Badge>}
                            {result.hasSchema && <Badge className="text-[10px] bg-green-500/20 text-green-400">Schema</Badge>}
                            {!result.hasTitle && <Badge className="text-[10px] bg-red-500/20 text-red-400">No Title</Badge>}
                            {!result.hasDescription && <Badge className="text-[10px] bg-red-500/20 text-red-400">No Meta</Badge>}
                          </div>
                          {result.issues.length > 0 && (
                            <div className="text-xs text-red-400">
                              Issues: {result.issues.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No SEO data available</p>
                    <p className="text-sm mb-4">Run an SEO check to analyze all pages</p>
                    <Button onClick={runSEOCheck} disabled={seoFetching}>
                      {seoFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Run SEO Check
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Broken Links */}
            {seoReport && seoReport.brokenLinks.length > 0 && (
              <Card className="glass-card border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <LinkIcon className="w-5 h-5" />
                    Broken Links ({seoReport.brokenLinks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {seoReport.brokenLinks.map((link, i) => (
                      <li key={i} className="text-sm flex items-center gap-2 text-red-400">
                        <XCircle className="w-4 h-4" />
                        {link}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Insights Engine
                  </CardTitle>
                  <CardDescription>Daily crypto news and analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Articles</span>
                    <span className="text-xl font-bold">{contentStats?.insightsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="outline">insights-engine</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm">Running</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Learn Engine
                  </CardTitle>
                  <CardDescription>Educational crypto content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Articles</span>
                    <span className="text-xl font-bold">{contentStats?.learnCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="outline">ai-blog</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm">Running</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
                <CardDescription>Daily article generation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Today's Articles</span>
                      <span>{contentStats?.todayCount || 0} / 40</span>
                    </div>
                    <Progress value={((contentStats?.todayCount || 0) / 40) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{contentStats?.totalCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Articles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">40</p>
                      <p className="text-xs text-muted-foreground">Daily Target</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">6:00</p>
                      <p className="text-xs text-muted-foreground">UTC Refresh</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">∞</p>
                      <p className="text-xs text-muted-foreground">Append Only</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>Page performance metrics from SEO check</CardDescription>
              </CardHeader>
              <CardContent>
                {seoReport ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-primary/10">
                      <p className="text-3xl font-bold">{seoReport.coreWebVitals?.averageResponseTime || 0}ms</p>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-500/10">
                      <p className="text-3xl font-bold text-green-400">{seoReport.coreWebVitals?.fastPages || 0}</p>
                      <p className="text-sm text-muted-foreground">Fast Pages</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-500/10">
                      <p className="text-3xl font-bold text-red-400">{seoReport.coreWebVitals?.slowPages || 0}</p>
                      <p className="text-sm text-muted-foreground">Slow Pages</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Run an SEO check to see performance data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slow Pages List */}
            {seoReport && seoReport.slowPages.length > 0 && (
              <Card className="glass-card border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Clock className="w-5 h-5" />
                    Slow Pages ({seoReport.slowPages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {seoReport.slowPages.map((page, i) => (
                      <li key={i} className="text-sm flex items-center gap-2 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        {page}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Last Updated Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-primary/10">
          <p>
            Last content update: {contentStats?.lastUpdated ? new Date(contentStats.lastUpdated).toLocaleString() : 'Unknown'}
            {seoReport && ` | Last SEO check: ${new Date(seoReport.timestamp).toLocaleString()}`}
          </p>
        </div>
      </div>
    </Layout>
  );
}
