const fs = require('fs');

async function fetchFiles() {
  for (const f of ['main.tsx', 'App.tsx', 'pages/Explorer.tsx', 'components/seo/index.ts', 'components/home/SEOContentBlock.tsx']) {
    try {
      const resp = await fetch(`http://localhost:8080/src/${f}`);
      const text = await resp.text();
      fs.writeFileSync(`_tmp_${f.replace(/\//g, '_')}.log`, `URL: ${f}\nSTATUS: ${resp.status}\n\n` + text);
    } catch (e) {
      fs.writeFileSync(`_tmp_${f.replace(/\//g, '_')}.log`, `URL: ${f}\nERROR: ${e.message}`);
    }
  }
}
fetchFiles();
