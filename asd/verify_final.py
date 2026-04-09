import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Increased viewport height to see more content
        page = await browser.new_page(viewport={'width': 1280, 'height': 2000})

        try:
            # Go to home
            await page.goto('http://localhost:3000', timeout=60000)
            await page.wait_for_timeout(3000)

            # Click Settings
            buttons = await page.query_selector_all('button')
            for b in buttons:
                text = await b.inner_text()
                if "SETTINGS" in text.upper():
                    await b.click()
                    break

            await page.wait_for_timeout(3000)
            await page.screenshot(path='/home/jules/verification/screenshots/settings_final_v2.png')

            # Go back to Dashboard to check tooltips
            for b in buttons:
                text = await b.inner_text()
                if "DASHBOARD" in text.upper():
                    await b.click()
                    break
            await page.wait_for_timeout(2000)

            # Hover over Safe to Spend (usually the first big number)
            # Find the "Safe to Spend" text and hover over its parent or sibling
            await page.hover('text=Safe to Spend')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/screenshots/dashboard_tooltip_final.png')

            print("Final verification screenshots captured.")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path='/home/jules/verification/screenshots/final_error.png')
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
