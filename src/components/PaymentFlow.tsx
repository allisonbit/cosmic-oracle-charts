import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function PaymentFlow() {
  return (
    <Card className="w-full max-w-md mx-auto cosmic-card border-white/10 glass-panel">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="text-green-500 h-6 w-6" />
          Oracle Bull Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center space-y-2">
          <ShieldCheck className="h-10 w-10 text-green-500 mx-auto" />
          <h3 className="font-medium text-green-400">Premium Active</h3>
          <p className="text-muted-foreground text-sm">You have full access to all Oracle Bull features.</p>
        </div>
      </CardContent>
    </Card>
  );
}
