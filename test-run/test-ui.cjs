const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'dashboard.png' });
  
  await page.goto('http://localhost:5173/chain/ethereum', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'chain.png' });
  
  await page.goto('http://localhost:5173/price-prediction/bitcoin/daily', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'token.png' });
  
  await browser.close();
})();
