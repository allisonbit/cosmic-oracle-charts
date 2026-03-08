import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyWatchlist } from "@/components/hub/MyWatchlist";
import { MyAlerts } from "@/components/hub/MyAlerts";
import { MyPortfolio } from "@/components/hub/MyPortfolio";
import { MySettings } from "@/components/hub/MySettings";
import { Star, Bell, PieChart, Settings, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";

function HubContent() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "watchlist";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.display_name ? `Welcome, ${profile.display_name.split(" ")[0]}` : "My Hub"}
              </h1>
              <p className="text-sm text-muted-foreground">Your personal crypto command center</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
            <TabsTrigger value="watchlist" className="gap-2 text-sm">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2 text-sm">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-6">
            <MyWatchlist />
          </TabsContent>
          <TabsContent value="portfolio" className="mt-6">
            <MyPortfolio />
          </TabsContent>
          <TabsContent value="alerts" className="mt-6">
            <MyAlerts />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <MySettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function MyHub() {
  return (
    <ProtectedRoute>
      <HubContent />
    </ProtectedRoute>
  );
}
