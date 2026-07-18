# Next-Up Implementation Plan

Execute in order, one after the other. Each step ships before starting the next.

## Step 1 — Live end-to-end email test
- Trigger `preview-daily-digest` + `send-daily-digest` against a test address.
- Verify row lands in `email_send_log` with status `sent`.
- Confirm unsubscribe link inserts into `suppressed_emails` and blocks resend.
- Fix any queue/render errors surfaced.

## Step 2 — Wire Welcome email on signup
- Fire `send-transactional-email` (template `welcome`) when a new row is inserted in `digest_subscribers` (and on first wallet-linked profile creation).
- Use `idempotencyKey = welcome-<subscriber_id>` so retries never duplicate.
- Add to the client-side signup handler in `DigestSignup.tsx`.

## Step 3 — Add 3 new app email templates
- `price-alert-hit` — triggered by the existing `user_alerts` cron when a threshold fires.
- `weekly-report` — sent Mondays from the existing `weekly-report` function using the latest `weekly_reports` snapshot.
- `prediction-resolved` — sent when `resolve-predictions` grades a user's forecast.
- Register each in `_shared/transactional-email-templates/registry.ts` and deploy.

## Step 4 — SEO / perf sweep
- Re-run Lighthouse-style checks on `/`, `/dashboard`, `/m`, top `/predict/*`.
- Fix any console errors, 4xx network calls, missing image dimensions, oversized LCP.
- Confirm sitemap + robots still in sync with new routes.

## Step 5 — Backlink outreach kickoff
- Seed `/admin/backlinks` with the top 20 targets (CoinGecko, CMC, Product Hunt, GitHub awesome-crypto lists, DeFiLlama, CryptoPanic, etc.).
- Prefill outreach templates per target category.

## Technical notes
- All email work uses existing infra: `notify.oraclebull.com`, `process-email-queue`, `send-transactional-email`.
- No new tables required for steps 1–3; steps 2–3 only add templates + trigger call sites.
- Step 4 is pure frontend/config. Step 5 is data-seed only.

Starting with **Step 1** immediately after approval.