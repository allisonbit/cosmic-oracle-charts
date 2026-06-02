const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(path.join(__dirname, 'src'));
const links = new Set();
const definedRoutes = new Set();

// Extract defined routes from App.tsx
const appTsx = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf-8');
const routeRegex = /<Route[^>]*path=["']([^"']+)["']/g;
let match;
while ((match = routeRegex.exec(appTsx)) !== null) {
  definedRoutes.add(match[1]);
}

// Add known dynamic bases
definedRoutes.add('/price-prediction/:id/:timeframe');
definedRoutes.add('/price-prediction/:id');
definedRoutes.add('/chain/:chain');
definedRoutes.add('/q/:question');
definedRoutes.add('/market/:category');

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Match to="/..." and navigate("/...")
  const linkRegex = /(?:to|href)=["']([^"']+)["']|navigate\(["']([^"']+)["']\)/g;
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    const link = m[1] || m[2];
    if (link.startsWith('/')) {
      links.add(link);
    }
  }
}

const brokenLinks = [];
for (const link of links) {
  // Ignore dynamic matches for now if they have template literals like /price-prediction/${id}
  if (link.includes('${')) continue;
  
  let isMatched = false;
  for (const route of definedRoutes) {
    // Simple path-to-regexp loose match
    const regexStr = '^' + route.replace(/:[^\s/]+/g, '([^/]+)') + '$';
    const regex = new RegExp(regexStr);
    if (regex.test(link)) {
      isMatched = true;
      break;
    }
  }
  
  if (!isMatched && link !== '/' && !link.startsWith('http')) {
    brokenLinks.push(link);
  }
}

console.log("Defined Routes:", Array.from(definedRoutes).length);
console.log("Unique Internal Links Found:", links.size);
console.log("Potentially Broken Links:");
console.log(brokenLinks);
