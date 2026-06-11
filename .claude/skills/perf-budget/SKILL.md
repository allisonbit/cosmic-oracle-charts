---
name: perf-budget
description: Check OracleBull's built bundle against a performance budget — entry-chunk size, largest chunks, and that the heavy wallet stack (Privy/viem) and recharts stay lazy-loaded OUT of the initial bundle. Use when asked about performance, Core Web Vitals, bundle size, or page load time.
---

# Performance budget check

Run after `npm run build`. The architecture already code-splits well — the job is to keep it that way.

## Baseline (measured) and budgets

| Asset | Measured | Budget | Note |
|---|---|---|---|
| Entry chunk `index-*.js` | ~574 KB | < 650 KB raw | first-load JS on every route; main lever |
| `PrivyLayer-*.js` (wallet/viem) | ~1.96 MB | MUST stay lazy | only `src/auth/PrivyLayer.tsx` may static-import `@privy-io`; loaded via `lazy()` in `useAuth.tsx` |
| recharts `generateCategoricalChart-*.js` | ~349 KB | MUST stay lazy | only chart components import `recharts` |
| supabase client chunk | ~180 KB | keep split | not in entry |
| total `dist/assets` JS | ~8.4 MB | informational | most is lazy route/vendor chunks |

## Steps

1. `ls -la dist/assets/ | sort -k5 -n -r | head -15` — list the largest chunks.
2. Identify the entry chunk (referenced in `dist/index.html`) and assert it is under budget:
   `grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' dist/index.html`
3. Assert the wallet stack is NOT in the entry graph (it must be its own lazy chunk):
   - `PrivyLayer-*.js` exists as a separate file, and
   - no `src/**` file outside `src/auth/PrivyLayer.tsx` statically imports `@privy-io` or top-level `viem`:
     `grep -rn "@privy-io" src --include=*.tsx | grep -v PrivyLayer`
4. Assert recharts only appears in chart components, never eager in `App.tsx`/`main.tsx`/`Index`.
5. **Do NOT** add a `build.rollupOptions.manualChunks` that splits the React/vendor graph — a prior
   manualChunks split caused a production-only TDZ error ("Cannot access 'S' before initialization")
   and a black screen after deploy (see the comment in `vite.config.ts`). If chunking, split only
   leaf vendor packages with no cross-dependencies, and verify with `npm run scan` after.

## Cheap wins to consider
- Convert `src/assets/*.jpg` hero/mascot (135 KB / 71 KB) to WebP and add explicit width/height.
- Preconnect to the data API origins in `index.html`.
- Confirm AdSense/3rd-party scripts load `async`/lazily and don't block LCP.
