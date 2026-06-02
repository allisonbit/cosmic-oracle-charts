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

const files = walk('./src');
let totalFixed = 0;

// Fixes pattern: something.(property ?? 0).toFixed()
// To: (something.property ?? 0).toFixed()
const RE = /([a-zA-Z_$][a-zA-Z0-9_$]*)\.\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\?\?\s*0\)\.(toLocaleString|toFixed|toPrecision|toExponential)/g;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const patched = original.replace(RE, (match, base, prop, method) => {
    return `(${base}.${prop} ?? 0).${method}`;
  });
  
  if (patched !== original) {
    fs.writeFileSync(file, patched);
    totalFixed++;
    console.log(`Fixed syntax in: ${file}`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
