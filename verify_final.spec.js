import { test, expect } from '@playwright/test';

test('verify dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('Safe to Spend')).toBeVisible();
  await page.screenshot({ path: 'final_dashboard.png' });
});

test('verify monthly dues', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('button:has-text("Monthly Dues")');
  await expect(page.getByText('Payday Cashflow Calendar')).toBeVisible();
  await page.screenshot({ path: 'final_monthly_dues.png' });
});
