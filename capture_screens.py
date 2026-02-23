from playwright.sync_api import sync_playwright
import time

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            page.goto("http://localhost:3000")
            time.sleep(15)
            page.screenshot(path="public/screenshots/audit/01-dashboard.png")
            print("Dashboard captured")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    capture()
