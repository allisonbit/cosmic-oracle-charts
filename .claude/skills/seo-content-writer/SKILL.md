---
name: seo-content-writer
description: Write a new long-form educational (/learn) or insights (/insights) article for OracleBull in the existing data schema, optimized for organic search (unique, substantive, E-E-A-T) AND wired so it gets prerendered into static HTML. Use when asked to add or write crypto guides, articles, or grow content for SEO.
---

# Write SEO content (learn / insights)

## Where content lives

- **Insights** articles: `src/data/insightsArticles.ts` — full hand-written articles. Match the
  existing object shape exactly (id, slug, title, excerpt, content, date, readTime, category, …).
- **Educational** (`/learn`) articles: served from `public/data/educational-articles.json`
  (fetched by `src/hooks/useEducationalArticles.ts`). Shape = the `EducationalArticle` interface in
  `src/lib/educationalArticles.ts`: `slug, title, metaTitle, metaDescription, category, readTime,
  content, faqs[], relatedLinks[], primaryKeyword, secondaryKeywords[]`.

## Rules for a page that actually ranks

1. **800–1500+ words** of genuinely unique, useful content — never spun boilerplate.
2. Target **one primary keyword** with real demand; weave 3–5 secondary keywords naturally.
3. Clear H1, structured H2/H3 sections, and **3+ FAQs** (these feed FAQ JSON-LD).
4. **3+ internal links** to money pages (`/price-prediction/<coin>`, `/compare/...`, tools).
5. Accurate and current as of the build date; include a brief "not financial advice" note.

## CRITICAL: make it prerendered (otherwise it will not rank)

Today `/learn/<slug>` and `/insights/<slug>` **article pages are NOT prerendered** — they are in the
sitemap but ship as empty SPA shells (Googlebot's first pass gets the homepage title + no article
text). Adding content to the data file is not enough.

After writing the article, **register its slug + a baked summary in `scripts/seo-prerender.mjs`** so
the title, intro paragraph(s), and FAQ are written into the static HTML (mirror how `/price-prediction`
or `/q` routes are added via `add(path, { title, description, h1, intro, faq, links })`). Then:

1. `npm run build`
2. Confirm baked content: `grep -c 'id="seo-prerender"' dist/learn/<slug>/index.html` → expect `1`,
   and the `<title>` is the article's own title.
3. typecheck + lint, ship via **ship-safe**, then **verify-prod-seo**.
