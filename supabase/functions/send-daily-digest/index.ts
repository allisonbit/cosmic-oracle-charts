// Daily 08:00 UTC digest — sends the Oracle Bull branded digest to each
// active subscriber via the shared email queue.
//
// Also callable ad-hoc with { test_recipient: "you@x.com" } to fire a one-off
// preview send (used by /admin/digest-preview "Send test to me").

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildDigestHtml, fetchDigestData, type DigestData } from "../_shared/digest-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://oraclebull.com";
const SENDER_DOMAIN = Deno.env.get("SENDER_DOMAIN") ?? "notify.oraclebull.com";
const FROM_ADDRESS = `Oracle Bull <digest@${SENDER_DOMAIN}>`;

async function enqueueDigest(
  supabase: ReturnType<typeof createClient>,
  args: {
    recipient: string;
    subject: string;
    html: string;
    unsubscribeToken: string;
    idempotencyKey: string;
  },
) {
  const messageId = crypto.randomUUID();
  const payload = {
    to: args.recipient,
    from: FROM_ADDRESS,
    sender_domain: SENDER_DOMAIN,
    subject: args.subject,
    html: args.html,
    purpose: "transactional",
    label: "daily-digest",
    idempotency_key: args.idempotencyKey,
    message_id: messageId,
    unsubscribe_token: args.unsubscribeToken,
    queued_at: new Date().toISOString(),
  };
  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  } as any);
  return { error, messageId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { test_recipient?: string } = {};
  try { body = await req.json(); } catch { /* GET or empty */ }

  const data: DigestData = await fetchDigestData(supabase);
  const today = new Date().toISOString().slice(0, 10);
  const topMover = data.gainers[0];
  const subject = topMover
    ? `Oracle Bull · ${today} — ${topMover.symbol?.toUpperCase()} +${topMover.change24h.toFixed(1)}%`
    : `Oracle Bull · Daily Digest · ${today}`;

  // TEST SEND: single recipient, no subscriber lookup, no last_sent bookkeeping
  if (body.test_recipient) {
    const html = buildDigestHtml({
      ...data,
      unsubscribeUrl: `${SITE}/unsubscribe?token=test`,
      date: today,
    });
    const { error, messageId } = await enqueueDigest(supabase, {
      recipient: body.test_recipient,
      subject: `[TEST] ${subject}`,
      html,
      unsubscribeToken: "test",
      idempotencyKey: `daily-digest-test-${Date.now()}`,
    });
    return new Response(
      JSON.stringify({ ok: !error, test: true, recipient: body.test_recipient, message_id: messageId, error: error?.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const { data: subs } = await supabase
    .from("digest_subscribers")
    .select("id, email, unsubscribe_token")
    .eq("is_active", true);

  // Skip anyone the provider has suppressed (bounced / complained / unsubscribed)
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("email");
  const blocked = new Set((suppressed ?? []).map((r: any) => r.email.toLowerCase()));

  let queued = 0;
  let skipped = 0;

  for (const s of subs ?? []) {
    if (blocked.has(s.email.toLowerCase())) { skipped++; continue; }
    const unsubscribeUrl = `${SITE}/unsubscribe?token=${s.unsubscribe_token}`;
    const html = buildDigestHtml({ ...data, unsubscribeUrl, date: today });
    const { error } = await enqueueDigest(supabase, {
      recipient: s.email,
      subject,
      html,
      unsubscribeToken: s.unsubscribe_token,
      idempotencyKey: `daily-digest-${today}-${s.id}`,
    });
    if (error) { skipped++; continue; }
    queued++;
    await supabase
      .from("digest_subscribers")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", s.id);
  }

  return new Response(
    JSON.stringify({ ok: true, subscribers: subs?.length ?? 0, queued, skipped }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
});
