// Technical SEO audit over the prerendered dist/. Read-only analysis.
// Run: node scripts/seo-audit.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Recursively collect index.html files (the prerendered routes).
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['assets', 'data'].includes(e.name)) continue;
      walk(full, acc);
    } else if (e.name === 'index.html' || e.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(distDir);
const get = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

const pages = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const route = '/' + path.relative(distDir, f).replace(/\\/g, '/').replace(/\/?index\.html$/, '').replace(/\.html$/, '');
  const title = get(html, /<title>([\s\S]*?)<\/title>/);
  const desc = get(html, /<meta\s+name="description"\s+content="([^"]*)"/);
  const canonical = get(html, /<link\s+rel="canonical"\s+href="([^"]*)"/);
  const h1count = (html.match(/<h1[\s>]/g) || []).length;
  const jsonldBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  let jsonldOk = true;
  for (const b of jsonldBlocks) {
    const body = b.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    try { JSON.parse(body); } catch { jsonldOk = false; }
  }
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
  pages.push({ route: route === '' ? '/' : route, title, desc, canonical, h1count, jsonldCount: jsonldBlocks.length, jsonldOk, links, file: f });
}

const norm = (r) => r.replace(/\/$/, '') || '/';
const known = new Set(pages.map((p) => norm(p.route)));

// ── Checks ──
const issues = { dupTitles: [], dupDesc: [], noCanonical: [], badH1: [], badJsonld: [], longTitle: [], shortDesc: [], longDesc: [], brokenInternal: [] };

const titleMap = {}, descMap = {};
for (const p of pages) {
  if (p.title) (titleMap[p.title] ||= []).push(p.route);
  if (p.desc) (descMap[p.desc] ||= []).push(p.route);
  if (!p.canonical) issues.noCanonical.push(p.route);
  if (p.h1count !== 1) issues.badH1.push(`${p.route} (h1=${p.h1count})`);
  if (!p.jsonldOk) issues.badJsonld.push(p.route);
  if (p.title && p.title.length > 65) issues.longTitle.push(`${p.route} (${p.title.length})`);
  if (p.desc && p.desc.length < 70) issues.shortDesc.push(`${p.route} (${p.desc.length})`);
  if (p.desc && p.desc.length > 165) issues.longDesc.push(`${p.route} (${p.desc.length})`);
}
for (const [t, rs] of Object.entries(titleMap)) if (rs.length > 1) issues.dupTitles.push({ title: t.slice(0, 60), routes: rs });
for (const [d, rs] of Object.entries(descMap)) if (rs.length > 1) issues.dupDesc.push({ routes: rs.length, sample: rs.slice(0, 3) });

// Broken internal links: link target not in known routes (ignore anchors, files, dynamic my/admin/explorer detail, query strings)
const ignorePrefix = ['/my', '/admin', '/explorer/', '/trade', '/liquidations'];
const brokenSet = new Map();
for (const p of pages) {
  for (const l of new Set(p.links)) {
    const target = norm(l.split('#')[0].split('?')[0]);
    if (!target || target === '/') continue;
    if (/\.[a-z0-9]+$/i.test(target)) continue; // asset
    if (ignorePrefix.some((pre) => target.startsWith(pre))) continue;
    if (!known.has(target)) {
      if (!brokenSet.has(target)) brokenSet.set(target, new Set());
      brokenSet.get(target).add(p.route);
    }
  }
}

// Orphans: prerendered routes that no other prerendered page links to.
const linkedTo = new Set();
for (const p of pages) for (const l of p.links) linkedTo.add(norm(l.split('#')[0].split('?')[0]));
const orphans = pages.map((p) => norm(p.route)).filter((r) => r !== '/' && !linkedTo.has(r));

// ── Report ──
console.log(`\n=== SEO AUDIT — ${pages.length} prerendered pages ===\n`);
console.log(`Pages missing canonical : ${issues.noCanonical.length}`);
console.log(`Pages with h1 != 1      : ${issues.badH1.length}`);
console.log(`Pages w/ invalid JSON-LD: ${issues.badJsonld.length}`);
console.log(`Duplicate <title> groups: ${issues.dupTitles.length}`);
console.log(`Duplicate descriptions  : ${issues.dupDesc.length} groups`);
console.log(`Titles > 65 chars       : ${issues.longTitle.length}`);
console.log(`Descriptions < 70 chars : ${issues.shortDesc.length}`);
console.log(`Descriptions > 165 chars: ${issues.longDesc.length}`);
console.log(`Broken internal targets : ${brokenSet.size}`);
console.log(`Orphan pages (no inlink): ${orphans.length}`);

const show = (label, arr, n = 15) => { if (arr.length) { console.log(`\n--- ${label} (${arr.length}) ---`); console.log(arr.slice(0, n).map((x) => '  ' + (typeof x === 'string' ? x : JSON.stringify(x))).join('\n')); if (arr.length > n) console.log(`  …+${arr.length - n} more`); } };
show('Missing canonical', issues.noCanonical);
show('h1 != 1', issues.badH1);
show('Invalid JSON-LD', issues.badJsonld);
show('Duplicate titles', issues.dupTitles, 10);
show('Long titles (>65)', issues.longTitle, 10);
show('Short descriptions (<70)', issues.shortDesc, 10);
show('Long descriptions (>165)', issues.longDesc, 10);
show('Broken internal link targets', [...brokenSet.entries()].map(([t, from]) => `${t}  ← from ${[...from][0]}${from.size > 1 ? ` (+${from.size - 1})` : ''}`), 25);
show('Orphan pages', orphans, 25);
console.log('');
