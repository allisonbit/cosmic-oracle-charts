/**
 * Safe null-guard patcher v2.
 * Correctly wraps `a.b.c.toFixed(` → `(a.b.c ?? 0).toFixed(`
 * without corrupting property chains like `coin.price` → `coin.(price ?? 0)`.
 */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(walk(full));
    else if (/\.(tsx?|jsx?)$/.test(f)) results.push(full);
  }
  return results;
}

const METHODS = ['toLocaleString', 'toFixed', 'toPrecision', 'toExponential'];

// Matches a full JS member expression (identifiers joined by dots, no spaces)
// followed by .toXxx( — but NOT when preceded by `?? 0)` or `?.`
const METHOD_RE = new RegExp(
  // Negative lookbehind: don't match if already wrapped
  '(?<!\\?\\?\\s*0\\s*\\))' +
  // Capture: one or more identifier segments separated by dots
  '\\b([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)' +
  // The formatting method
  '\\.(' + METHODS.join('|') + ')\\(',
  'g'
);

// Known-safe roots that should never be wrapped
const SAFE_ROOTS = new Set([
  'Math', 'Object', 'Array', 'JSON', 'String', 'Number', 'Boolean',
  'Date', 'Error', 'Promise', 'console', 'window', 'document',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'liveTime', 'lastUpdate', 'new',
  // React / common hooks
  'React', 'useState', 'useEffect', 'useMemo', 'useCallback',
]);

function patchContent(content) {
  return content.replace(METHOD_RE, (match, expr, method, offset, str) => {
    // Skip if already wrapped: ( expr ?? 0 ).method(
    const before = str.slice(Math.max(0, offset - 10), offset);
    if (/\(\s*$/.test(before) && str.slice(Math.max(0, offset - 20), offset).includes('?? 0')) {
      return match;
    }
    // Skip optional chain: ?.method(
    if (str.slice(Math.max(0, offset - 2), offset) === '?.') return match;

    // Skip safe roots
    const root = expr.split('.')[0];
    if (SAFE_ROOTS.has(root)) return match;

    // Skip if expr itself ends with ) meaning it's a function call result — already computed
    // (shouldn't happen with our regex but be safe)
    if (expr.endsWith(')')) return match;

    return `(${expr} ?? 0).${method}(`;
  });
}

const files = walk('./src');
let totalFixed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const patched = patchContent(original);
  if (patched !== original) {
    fs.writeFileSync(file, patched);
    totalFixed++;
    // Show what changed
    const origLines = original.split('\n');
    const newLines = patched.split('\n');
    for (let i = 0; i < origLines.length; i++) {
      if (origLines[i] !== newLines[i]) {
        console.log(`  [${path.basename(file)}:${i+1}] ${origLines[i].trim().slice(0,80)}`);
        console.log(`  → ${newLines[i].trim().slice(0,80)}`);
      }
    }
    console.log(`Patched: ${file.replace('./src/', '')}\n`);
  }
}

console.log(`Done. Patched ${totalFixed} files.`);
