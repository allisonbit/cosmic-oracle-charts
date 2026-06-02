const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix formatNumber
  const regex1 = /function\s+formatNumber\s*\(\s*num\s*:\s*number\s*\)\s*:\s*string\s*\{/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, `function formatNumber(num: number | undefined | null): string {\n  if (num === undefined || num === null || isNaN(num)) return '—';`);
    changed = true;
  }

  // Fix formatNumberRaw
  const regex2 = /function\s+formatNumberRaw\s*\(\s*num\s*:\s*number\s*\)\s*:\s*string\s*\{/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, `function formatNumberRaw(num: number | undefined | null): string {\n  if (num === undefined || num === null || isNaN(num)) return '—';`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
