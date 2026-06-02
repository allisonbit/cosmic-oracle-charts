const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message, err.stack);
  });

  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Navigated to dashboard');
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  await browser.close();
})();
