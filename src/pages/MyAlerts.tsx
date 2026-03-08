import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MyAlerts } from "@/components/hub/MyAlerts";
import { Bell } from "lucide-react";

function AlertsContent() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
            <p className="text-sm text-muted-foreground">Get notified when prices hit your targets</p>
          </div>
        </div>
        <MyAlerts />
      </div>
    </Layout>
  );
}

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}
