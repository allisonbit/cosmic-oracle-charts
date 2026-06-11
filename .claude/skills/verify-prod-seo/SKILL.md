---
name: verify-prod-seo
description: Verify the LIVE oraclebull.com site actually serves its prerendered SEO pages — each clean URL must return its OWN baked <title> and self-referencing canonical, not the homepage. Run after any deploy or change to vercel.json, scripts/seo-prerender.mjs, or index.html. Guards the cleanUrls catch-all-rewrite regression that once neutralized all ~1,660 prerendered pages.
---

# Verify production SEO (prerender delivery)

OracleBull prerenders ~1,660 pages to static HTML at build time (`scripts/seo-prerender.mjs`).
A Vercel `rewrites` catch-all (`/(.*) -> /index.html`) once served the homepage HTML for
**every** clean URL, silently defeating all of it (every page returned the homepage `<title>`
and `canonical=https://oraclebull.com/`, so Google treated the whole site as duplicates of `/`).
This skill confirms each page family serves its own prerendered content in production.

## Steps

1. Probe one representative URL per prerendered family (clean URL, no trailing slash, no JS):

   ```bash
   for p in "" "price-prediction/bitcoin" "compare/bitcoin-vs-ethereum" \
            "q/will-bitcoin-go-up-today" "market/best-crypto-to-buy-today" \
            "how-to-buy/solana" "chain/ethereum"; do
     echo "/$p ->"
     curl -s --max-time 25 "https://oraclebull.com/$p" \
       | grep -oE '<title>[^<]*</title>|<link rel="canonical"[^>]*>' | head -2
   done
   ```

2. **PASS** only if each non-home URL returns a UNIQUE title naming the page topic
   (e.g. `Bitcoin vs Ethereum – Which Is Better?`) AND a self-referencing canonical
   (`https://oraclebull.com/<that-path>`).

3. **FAIL** if any non-home URL returns the homepage title
   (`Free AI Crypto Predictions | Oracle Bull`) or `canonical=https://oraclebull.com/`.
   That means the catch-all rewrite is hijacking clean URLs again.
   **Fix:** `vercel.json` must have `"cleanUrls": true`, `"trailingSlash": false`, and a
   rewrite `source` of `/((?!.*\\.).*)` (extensionless paths only). The prerendered files
   already exist on disk — requesting `/<path>/index.html` explicitly proves it; the bug is
   purely that the clean URL isn't resolved to the directory-index file before the rewrite.

4. Confirm the live sitemap is the generated one (~1,700 URLs), not the stale 587-entry
   `public/sitemap.xml` (which is overwritten at build):
   `curl -s https://oraclebull.com/sitemap.xml | grep -c "<loc>"`

5. Report a table: `URL | title unique? | canonical self-ref?` and list any failures + the fix.
