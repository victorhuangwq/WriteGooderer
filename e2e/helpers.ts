import puppeteer, { type Browser, type Page } from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, "../dist");
const DEMO_PAGE = `file://${path.resolve(__dirname, "../demo.html")}`;

export { DEMO_PAGE };

export async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // Use virtual display for headless environments
      "--disable-gpu",
      "--window-size=1280,900",
    ],
  });
  return browser;
}

export async function getExtensionId(browser: Browser): Promise<string> {
  // Wait for the service worker target to appear
  const swTarget = await browser.waitForTarget(
    (t) => t.type() === "service_worker" && t.url().includes("service-worker"),
    { timeout: 10000 }
  );
  const url = swTarget.url();
  // URL format: chrome-extension://<id>/service-worker.js
  const match = url.match(/chrome-extension:\/\/([^/]+)/);
  if (!match) throw new Error("Could not extract extension ID from: " + url);
  return match[1];
}

export async function enableTestMode(browser: Browser): Promise<void> {
  // Send SET_TEST_MODE from the popup page context (has chrome.runtime access)
  const extId = await getExtensionId(browser);
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${extId}/popup.html`, {
    waitUntil: "domcontentloaded",
  });
  const result = await page.evaluate(() => {
    return chrome.runtime.sendMessage({ type: "SET_TEST_MODE" });
  });
  console.log("[E2E] Test mode enabled:", result);
  await page.close();
}

export async function openDemoPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  await page.goto(DEMO_PAGE, { waitUntil: "domcontentloaded" });
  // Wait for content script to initialize
  await page.waitForSelector("#writegooderer-root", { timeout: 5000 });
  return page;
}

/**
 * Query an element inside the extension's Shadow DOM.
 * Returns an ElementHandle or null.
 */
export async function shadowQuery(
  page: Page,
  selector: string
): Promise<puppeteer.ElementHandle<Element> | null> {
  return page.evaluateHandle((sel) => {
    const host = document.querySelector("#writegooderer-root");
    if (!host || !host.shadowRoot) return null;
    return host.shadowRoot.querySelector(sel);
  }, selector) as any;
}

/**
 * Check if an element inside the Shadow DOM has a specific class.
 */
export async function shadowHasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  return page.evaluate(
    (sel, cls) => {
      const host = document.querySelector("#writegooderer-root");
      if (!host || !host.shadowRoot) return false;
      const el = host.shadowRoot.querySelector(sel);
      return el ? el.classList.contains(cls) : false;
    },
    selector,
    className
  );
}

/**
 * Get text content of an element inside the Shadow DOM.
 */
export async function shadowText(
  page: Page,
  selector: string
): Promise<string | null> {
  return page.evaluate((sel) => {
    const host = document.querySelector("#writegooderer-root");
    if (!host || !host.shadowRoot) return null;
    const el = host.shadowRoot.querySelector(sel);
    return el ? el.textContent : null;
  }, selector);
}

/**
 * Click an element inside the Shadow DOM.
 */
export async function shadowClick(
  page: Page,
  selector: string
): Promise<void> {
  await page.evaluate((sel) => {
    const host = document.querySelector("#writegooderer-root");
    if (!host || !host.shadowRoot) throw new Error("Shadow root not found");
    const el = host.shadowRoot.querySelector(sel) as HTMLElement;
    if (!el) throw new Error(`Element not found: ${sel}`);
    el.click();
  }, selector);
}

/**
 * Check if element exists and is visible in Shadow DOM.
 */
export async function shadowIsVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  return page.evaluate((sel) => {
    const host = document.querySelector("#writegooderer-root");
    if (!host || !host.shadowRoot) return false;
    const el = host.shadowRoot.querySelector(sel) as HTMLElement;
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.opacity !== "0";
  }, selector);
}

/**
 * Wait for a shadow DOM element to have a specific class.
 */
export async function waitForShadowClass(
  page: Page,
  selector: string,
  className: string,
  timeout = 3000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await shadowHasClass(page, selector, className)) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(
    `Timeout waiting for ${selector} to have class "${className}"`
  );
}
