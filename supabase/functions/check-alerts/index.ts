import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch all untriggered alerts
    const { data: alerts, error: alertErr } = await supabase
      .from("user_alerts")
      .select("*, profiles!inner(email, display_name, email_notifications)")
      .eq("is_triggered", false);

    if (alertErr) {
      console.error("Alert fetch error:", alertErr);
      throw alertErr;
    }

    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ checked: 0, triggered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get unique coin IDs and fetch prices
    const coinIds = [...new Set(alerts.map((a: any) => a.coin_id))];
    const ids = coinIds.join(",");

    const priceRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!priceRes.ok) {
      console.error("Price fetch failed:", priceRes.status);
      return new Response(JSON.stringify({ error: "Price fetch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prices = await priceRes.json();
    const triggered: any[] = [];

    // 3. Check each alert
    for (const alert of alerts) {
      const currentPrice = prices[alert.coin_id]?.usd;
      if (currentPrice === undefined) continue;

      const shouldTrigger =
        (alert.condition === "above" && currentPrice >= alert.target_price) ||
        (alert.condition === "below" && currentPrice <= alert.target_price);

      if (shouldTrigger) {
        // Mark as triggered
        await supabase
          .from("user_alerts")
          .update({
            is_triggered: true,
            triggered_at: new Date().toISOString(),
          })
          .eq("id", alert.id);

        triggered.push({ ...alert, current_price: currentPrice });

        // 4. Send email if user has email_notifications enabled
        const profile = (alert as any).profiles;
        if (profile?.email && profile?.email_notifications !== false && !alert.email_sent) {
          try {
            const emailBody = buildAlertEmail(
              profile.display_name || "Trader",
              alert.symbol,
              alert.condition,
              alert.target_price,
              currentPrice,
              alert.note
            );

            // Use Lovable AI to send a nicely formatted notification
            // For now, log the trigger. Email sending requires domain setup.
            console.log(`📧 ALERT TRIGGERED for ${profile.email}: ${alert.symbol} ${alert.condition} $${alert.target_price} (now $${currentPrice})`);

            // Mark email as sent
            await supabase
              .from("user_alerts")
              .update({ email_sent: true })
              .eq("id", alert.id);
          } catch (emailErr) {
            console.error("Email send error:", emailErr);
          }
        }
      }
    }

    console.log(`Checked ${alerts.length} alerts, triggered ${triggered.length}`);

    return new Response(JSON.stringify({
      checked: alerts.length,
      triggered: triggered.length,
      details: triggered.map(t => ({
        symbol: t.symbol,
        condition: t.condition,
        target: t.target_price,
        current: t.current_price,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-alerts error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAlertEmail(
  name: string,
  symbol: string,
  condition: string,
  targetPrice: number,
  currentPrice: number,
  note: string | null
): string {
  const direction = condition === "above" ? "risen above" : "dropped below";
  return `
    Hi ${name},

    🚨 Your ${symbol} price alert has been triggered!

    ${symbol} has ${direction} your target of $${targetPrice.toLocaleString()}.
    Current price: $${currentPrice.toLocaleString()}

    ${note ? `Your note: ${note}` : ""}

    View your alerts: https://cosmic-oracle-charts.lovable.app/my?tab=alerts

    — Oracle Bull AI 🐂
  `.trim();
}
