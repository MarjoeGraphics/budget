import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 1600})
        page = await context.new_page()

        try:
            print("Navigating to http://127.0.0.1:3000...")
            await page.goto('http://127.0.0.1:3000', wait_until="networkidle", timeout=60000)

            # 1. Dashboard screenshot
            await page.screenshot(path='/home/jules/verification/screenshots/dashboard_v6.png')
            print("Dashboard screenshot saved.")

            # 2. Goals screenshot (check large images)
            await page.click('button:has-text("Goals")')
            await page.wait_for_timeout(2000)
            await page.screenshot(path='/home/jules/verification/screenshots/goals_v6.png')
            print("Goals screenshot saved.")

            # 3. Monthly Dues screenshot (check savings badge)
            await page.click('button:has-text("Monthly Dues")')
            await page.wait_for_timeout(2000)
            await page.screenshot(path='/home/jules/verification/screenshots/dues_v6.png')
            print("Dues screenshot saved.")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
