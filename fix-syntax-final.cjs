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

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  
  // Example 1: `volumeData[0].(value ?? 0).toFixed`
  // We want to capture everything before `.` that is part of the expression.
  // Actually, since it's hard to parse backwards, let's just do a string replacement for the specific ones we saw,
  // or use a regex that captures a broad base.
  
  // The ones we saw in the log:
  let patched = original;
  
  // `predictionData.(ensembleModels... ?? 0)`
  patched = patched.replace(/predictionData\.\((ensembleModels[^?]+)\s*\?\?\s*0\)/g, '(predictionData.$1 ?? 0)');
  // `volumeData[0].(value ?? 0)` -> `(volumeData[0].value ?? 0)`
  patched = patched.replace(/volumeData\[(\d+)\]\.\((value)\s*\?\?\s*0\)/g, '(volumeData[$1].$2 ?? 0)');
  // `analysis.holdings.reduce(...).(change24h ?? 0)`
  patched = patched.replace(/(\.reduce\([^)]+\)\))\.(\(change24h\s*\?\?\s*0\))/g, (match, reduceCall) => {
    // This is hard to regex safely, so let's just revert those two lines manually in the replace logic
    return match; // We'll handle this manually
  });
  // `(ti as any).(vwap ?? 0)` -> `((ti as any).vwap ?? 0)`
  patched = patched.replace(/\(ti as any\)\.\(([^?]+)\s*\?\?\s*0\)/g, '((ti as any).$1 ?? 0)');
  // `data.(priceTargets... ?? 0)`
  patched = patched.replace(/data\.\((priceTargets[^?]+)\s*\?\?\s*0\)/g, '(data.$1 ?? 0)');
  
  if (patched !== original) {
    fs.writeFileSync(file, patched);
    totalFixed++;
    console.log(`Fixed specific deep syntax in: ${file}`);
  }
}

// Manually fix the reduce() calls in EnhancedWalletStats.tsx
const walletStatsPath = './src/components/portfolio/EnhancedWalletStats.tsx';
if (fs.existsSync(walletStatsPath)) {
    let content = fs.readFileSync(walletStatsPath, 'utf8');
    content = content.replace(/\)\.\(change24h \?\? 0\)/g, ').change24h');
    fs.writeFileSync(walletStatsPath, content);
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
