---
name: ship-safe
description: Safely ship changes to the live OracleBull site. Runs the full verification gate (typecheck, lint, build incl. SEO prerender, content spot-check) BEFORE committing and pushing to main, which auto-deploys to oraclebull.com via Vercel. Use whenever asked to deploy, ship, or push changes.
---

# Ship safely to production

`main` auto-deploys to oraclebull.com (Vercel, fronted by Cloudflare). NEVER push without the gate passing.

## Gate — all must pass

1. `npm run typecheck` — must exit 0.
2. `npm run lint` — must exit 0.
3. `npm run build` — must complete and print `[seo-prerender] ✅ Prerendered N/N routes`.
   This step catches prerender breakage: the string-replace logic in `scripts/seo-prerender.mjs`
   depends on anchors in `index.html` (`id="boot-fallback"`, `<noscript>`, `<title>`,
   `<meta name="description">`). If `index.html` changes those, the prerender silently no-ops
   and pages ship as **empty shells** — verify the anchors still exist.
4. Spot-check a prerendered page has baked content (expect `1`):
   `grep -c 'id="seo-prerender"' dist/compare/bitcoin-vs-ethereum/index.html`
5. (optional, slower) `npm run scan` — visits one URL per route type for fatal runtime errors.

## Commit + push

6. The repo gets frequent **Lovable auto-commits**, so ALWAYS sync first:
   `git fetch origin main && git rebase origin/main` — otherwise the push is rejected.
7. Commit with a clear conventional-commit message and the
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer. Push to `main`.
8. After deploy (~2–4 min), run the **verify-prod-seo** skill to confirm prod serves the new
   content and the cleanUrls routing still holds. `dist/` is gitignored — the host rebuilds
   from source, so never commit build output.
