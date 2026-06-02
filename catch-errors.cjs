const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  console.log('Loading http://localhost:5173 ...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 30000 });
    // Wait an additional 3 seconds for React to mount and potentially crash
    await new Promise(r => setTimeout(r, 3000));
  } catch (err) {
    console.log('Navigation error:', err.message);
  }

  const hasError = await page.evaluate(() => {
    return document.body.innerText.includes('Something went wrong');
  });

  if (hasError) {
    console.log('Error boundary was triggered!');
  } else {
    console.log('Page loaded successfully without ErrorBoundary.');
  }

  await browser.close();
})();
