import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 1600})

        try:
            await page.goto('http://localhost:3000', timeout=60000)
            await page.wait_for_selector('text=BudgetApp')

            # Click Settings - trying different case
            try:
                await page.click('button:has-text("Settings")')
            except:
                await page.click('text=Settings')

            await page.wait_for_timeout(2000)

            # Ensure we are on settings page by checking for a heading
            await page.wait_for_selector('h1:has-text("App Settings")')

            await page.screenshot(path='/home/jules/verification/screenshots/settings_final.png', full_page=True)
            print("Settings final screenshot captured.")

        except Exception as e:
            print(f"Error: {e}")
            # Take a diagnostic screenshot
            await page.screenshot(path='/home/jules/verification/screenshots/diagnostic_settings.png')
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
