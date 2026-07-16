const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.stack || error.message));
    page.on('response', response => {
      if (!response.ok()) {
        console.error('FAILED REQUEST:', response.url(), response.status());
      }
    });
    page.on('requestfailed', request => {
      console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log("Page loaded. Waiting 2 seconds...");
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
    console.log("Done.");
  } catch(e) {
    console.error("Test script failed:", e);
    process.exit(1);
  }
})();
