// Provider-agnostic email delivery webhook.
// Accepts a normalized event OR a Mailgun-style event; verifies an HMAC signature
// against the shared secret EMAIL_WEBHOOK_SECRET; updates email_send_log by
// message_id and inserts suppressions on bounce/complaint.
//
// Expected body (either shape works):
//   { message_id, event, recipient, reason?, provider? }        (normalized)
//   { "event-data": { message: { headers: { "message-id": ... } },
//                     event, recipient, ... } }                 (mailgun)
//
// event ∈ delivered | bounced | complained | opened | clicked | failed

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature, x-webhook-signature",
};

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const STATUS_MAP: Record<string, string> = {
  delivered: "sent",
  sent: "sent",
  bounced: "bounced",
  bounce: "bounced",
  complained: "complained",
  complaint: "complained",
  spam: "complained",
  failed: "failed",
  rejected: "failed",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const rawBody = await req.text();
  const secret = Deno.env.get("EMAIL_WEBHOOK_SECRET");
  if (secret) {
    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("x-webhook-signature") ||
      req.headers.get("x-mailgun-signature") ||
      "";
    const expected = await hmacHex(secret, rawBody);
    if (!signature || !timingSafeEq(signature.toLowerCase(), expected.toLowerCase())) {
      return new Response(JSON.stringify({ ok: false, error: "invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  let payload: any;
  try { payload = JSON.parse(rawBody); } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid json" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Normalize
  const eventData = payload["event-data"] ?? payload;
  const rawEvent = String(eventData.event ?? payload.event ?? "").toLowerCase();
  const messageId =
    payload.message_id ??
    eventData.message_id ??
    eventData?.message?.headers?.["message-id"] ??
    null;
  const recipient = payload.recipient ?? eventData.recipient ?? null;
  const reason = payload.reason ?? eventData.reason ?? eventData?.["delivery-status"]?.description ?? null;
  const status = STATUS_MAP[rawEvent];

  if (!messageId || !status) {
    return new Response(JSON.stringify({ ok: true, ignored: true, reason: "no message_id or unmapped event" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: existing } = await supabase
    .from("email_send_log")
    .select("id, recipient_email, template_name, metadata")
    .eq("message_id", messageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const target = recipient ?? existing?.recipient_email ?? "unknown@unknown";
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: existing?.template_name ?? "webhook",
    recipient_email: target,
    status,
    error_message: reason ?? null,
    metadata: { source: "webhook", raw_event: rawEvent, ...(eventData ?? {}) },
  });

  if (status === "bounced" || status === "complained") {
    const suppressionReason = status === "bounced" ? "bounce" : "complaint";
    await supabase
      .from("suppressed_emails")
      .upsert({
        email: target.toLowerCase(),
        reason: suppressionReason,
        metadata: { message_id: messageId, raw_event: rawEvent, note: reason ?? null },
      }, { onConflict: "email" });
  }

  return new Response(JSON.stringify({ ok: true, message_id: messageId, status }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
