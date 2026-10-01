# Oracle Bull — Free AI Crypto Predictions

Vite + React + TypeScript + Tailwind + shadcn-ui SPA. Now hosted on **Vercel** with a **Supabase** backend (email/password auth, edge functions, crons).

## Local development

```bash
npm install
cp .env.example .env    # then fill in your Supabase URL + publishable key
npm run dev             # http://localhost:8080
```

The build **fails** if `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are missing — no silent fallbacks to a dead project.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: **Vite**; `vercel.json` supplies build command, output dir, clean URLs and SPA rewrites).
2. Add environment variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy.

## Supabase project setup (new project)

1. **Database** — run everything in `supabase/migrations/` (SQL Editor or `supabase db push`).
2. **Edge functions** — `supabase functions deploy` for every folder in `supabase/functions/` (or `supabase functions deploy --project-ref <ref>` after linking).
3. **Auth** — Dashboard → Authentication → Providers → **Email → ON**. While testing you can disable "Confirm email" so signups work instantly; enable it again (with SMTP configured) for production.
4. **Crons** — scheduled edge functions (news aggregation, digests, accuracy tracking, sitemaps) keep running on Supabase's cron (pg_cron / scheduled triggers in the new project). Nothing runs on Vercel's side.

## What changed in the migration

- **Hosting:** Cloudflare Workers/Pages + Netlify configs removed (`wrangler.toml`, `netlify.toml` deleted; `vercel.json` added).
- **Auth:** Privy wallet login removed (`@privy-io/react-auth` uninstalled). Sign-in is now email/password via Supabase Auth (`SignInModal` + `useAuth`).
- **Lovable runtime bits removed** (`@lovable.dev/*`, `lovable-tagger`) — everything builds from this repo with no external builder.
- **Accuracy fixes:** every home signal coin (incl. ADA) has fallback data; honest "data unavailable" state instead of dash-filled cards; sane price formatting (`$680.00`, not `$680.000`).
- **Layout:** oversized section paddings tightened across home + major pages.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run smoke` | Smoke test against a deployed URL |
