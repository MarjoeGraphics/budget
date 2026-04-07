import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 1200})

        try:
            await page.goto('http://localhost:3000', timeout=60000)

            # Click Settings
            await page.click('text=SETTINGS')
            await page.wait_for_timeout(1000)

            # Check for Goal Types section
            await page.screenshot(path='/home/jules/verification/screenshots/settings_v3.png', full_page=True)
            print("Settings v3 screenshot captured.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
