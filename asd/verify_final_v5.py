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

            # Wait for any text to appear
            await page.wait_for_selector('text=BudgetApp', timeout=10000)
            print("Found BudgetApp logo.")

            # Click Settings
            await page.click('button:has-text("Settings")')
            await page.wait_for_timeout(2000)

            # Screenshot settings
            await page.screenshot(path='/home/jules/verification/screenshots/settings_final_v5.png')
            print("Settings screenshot saved.")

            # Click Dashboard
            await page.click('button:has-text("Dashboard")')
            await page.wait_for_timeout(2000)

            # Hover over a metric
            await page.hover('text=Safe to Spend')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/screenshots/dashboard_tooltip_final_v5.png')
            print("Dashboard tooltip screenshot saved.")

        except Exception as e:
            print(f"Error during verification: {e}")
            await page.screenshot(path='/home/jules/verification/screenshots/error_v5.png')
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
