// One-off generator: real PNG PWA icons from the mascot JPEG.
// Usage: node scripts/generate-pwa-icons.mjs
// Outputs public/icon-192.png, public/icon-512.png, public/icon-512-maskable.png
// (maskable variant adds 10% safe-zone padding on the brand background).
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcJpg = path.join(root, 'public', 'oracle-bot-mascot.jpg');
const dataUri = `data:image/jpeg;base64,${readFileSync(srcJpg).toString('base64')}`;

const browser = await puppeteer.launch();
const page = await browser.newPage();

async function render(size, { pad = 0, bg = null } = {}) {
  return page.evaluate(async ({ dataUri, size, pad, bg }) => {
    const img = new Image();
    img.src = dataUri;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
    const inner = size - pad * 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, pad, pad, inner, inner);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { dataUri, size, pad, bg });
}

const outputs = [
  ['icon-192.png', await render(192)],
  ['icon-512.png', await render(512)],
  // Maskable: 10% padding keeps the mascot inside the safe zone when masked.
  ['icon-512-maskable.png', await render(512, { pad: 51, bg: '#0f172a' })],
];
for (const [name, b64] of outputs) {
  const file = path.join(root, 'public', name);
  writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`wrote ${name} (${Math.round(Buffer.from(b64, 'base64').length / 1024)}KB)`);
}
await browser.close();
