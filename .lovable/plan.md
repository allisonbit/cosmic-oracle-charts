# Daily Digest Email — Implementation Plan

Four features, shipped in order. Each is small and independently verifiable.

---

## 1. Unsubscribe links + stop-send verification

**Goal:** Every digest email has a one-click unsubscribe. Once clicked, that address never gets another digest.

**Changes**
- `send-daily-digest` edge function:
  - For each subscriber, mint/lookup a token in `email_unsubscribe_tokens` (already exists from infra setup).
  - Inject `List-Unsubscribe` + `List-Unsubscribe-Post` headers (RFC 8058, one-click).
  - Add footer link: `https://oraclebull.com/api/unsubscribe?token=...`.
  - Before enqueueing, skip any address present in `suppressed_emails` OR where `digest_subscribers.active = false`.
- Reuse existing `handle-email-unsubscribe` edge function (scaffolded by infra). Extend it to also flip `digest_subscribers.active = false` and insert into `suppressed_emails` with `reason = 'unsubscribe'`.
- Public route `/unsubscribed` — confirmation page.

**Verification**
- Send test digest to a seeded subscriber, click unsubscribe, re-run `send-daily-digest`, confirm row is skipped and `email_send_log` shows no new send for that address.

---

## 2. Delivery + bounce tracking via webhooks

**Goal:** Per-subscriber delivery status (delivered / bounced / complained) visible in admin.

**Changes**
- New edge function `email-webhook` (public, HMAC-verified) at `/api/email-webhook`:
  - Accepts provider events (delivered, bounce, complaint, open — provider-agnostic JSON).
  - Updates matching `email_send_log` row by `message_id` → sets `status` to `delivered` / `bounced` / `complained`, writes provider event into `metadata`.
  - On bounce/complaint: insert into `suppressed_emails` (idempotent) so future sends skip.
- Migration: index `email_send_log(message_id)` if not present.
- Admin page `/admin/email-status` — table with dedup-by-message_id (per email-dashboard guide), status filter, timerange filter, per-subscriber view.

**Verification**
- POST synthetic webhook payloads (delivered + bounce), confirm log row updates and suppression insert.

---

## 3. Digest preview page

**Goal:** Render exactly what subscribers will receive, using sample or live data, before sending.

**Changes**
- Extract digest HTML builder from `send-daily-digest` into `supabase/functions/_shared/email-templates/daily-digest.tsx` (React Email).
- New edge function `preview-daily-digest` — returns rendered HTML for a given date (defaults to today) using live market data, or `?sample=1` for fixed fixture.
- Admin page `/admin/digest-preview`:
  - Renders the HTML in a sandboxed iframe.
  - Toggle: Live data / Sample data.
  - "Send test to me" button → invokes `send-daily-digest` with `test_recipient` param.

**Verification**
- Open `/admin/digest-preview`, confirm identical rendering to a real send captured via provider inbox.

---

## 4. Branded daily digest template

**Goal:** On-brand HTML template (Oracle Bull identity) with BTC/ETH top movers + AI forecast highlights.

**Template sections** (React Email components, mobile-first, 600px):
1. Header — Oracle Bull logo, tagline, date.
2. **BTC + ETH spotlight** — price, 24h %, 7d spark trend text, AI signal (bull/bear/neutral) with confidence.
3. **Top movers** — 5 gainers + 5 losers (24h) with symbol, price, %.
4. **AI forecast highlights** — 3 highest-confidence predictions from `predictions_cache` (coin, horizon, target, confidence).
5. **Narrative** — 1–2 sentence market summary from latest cached AI narrative.
6. CTA button → `oraclebull.com`.
7. Footer — unsubscribe link, physical address placeholder, "Not financial advice".

**Styling:** brand tokens from `index.css` (light theme, white bg per project rules), Inter font stack, brand blue accents.

**Data sources:** existing hooks/queries — `predictions_cache`, live market fetch in edge function (already used in current digest).

---

## Technical notes

- Order: build template (4) → wire preview (3) → send flow with unsubscribe (1) → webhooks (2). Template + preview first lets us visually iterate before touching send/suppression logic.
- All email HTML: `Body` bg stays `#ffffff` per email guide.
- No provider SDK — sends stay on Lovable Emails queue (`enqueue_email` → `process-email-queue`).
- Webhook endpoint uses a secret we'll add via `add_secret` when wiring provider.
- All admin pages gated by `has_role(auth.uid(),'admin')`.

Reply **"go"** to start with step 1 (branded template + preview), or tell me a different order.
