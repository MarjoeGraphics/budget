import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to Dashboard
  await page.goto('http://localhost:5173');
  await page.waitForSelector('text=Safe to Spend');
  await page.screenshot({ path: 'final_dashboard.png' });
  console.log('Dashboard screenshot taken');

  // Navigate to Monthly Dues
  await page.click('button:has-text("Monthly Dues")');
  await page.waitForSelector('text=Payday Cashflow Calendar');
  await page.screenshot({ path: 'final_monthly_dues.png' });
  console.log('Monthly Dues screenshot taken');

  await browser.close();
})();
