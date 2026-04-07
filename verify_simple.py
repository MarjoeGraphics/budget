import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 2000})
        await page.goto('http://localhost:3000', timeout=60000)
        await page.wait_for_timeout(5000)

        # Take home screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/home_simple.png')

        # Click Settings - use a more robust selector
        await page.locator('nav').get_by_text('Settings', exact=False).click()
        await page.wait_for_timeout(5000)

        # Take settings screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/settings_simple.png')
        print("Simple screenshots captured.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
