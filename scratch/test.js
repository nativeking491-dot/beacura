const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Listen to console and page errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded successfully.');
    // Try clicking 'Start Your Journey' if it's there
    const btn = await page.$('.btn-primary');
    if (btn) {
        console.log("Clicking 'Start Your Journey'");
        await btn.click();
        await page.waitForTimeout(2000);
    }
  } catch (err) {
    console.error('NAVIGATION ERROR:', err.message);
  }

  await browser.close();
})();
