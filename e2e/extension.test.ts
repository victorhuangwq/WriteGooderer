import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Browser, Page } from "puppeteer";
import {
  launchBrowser,
  getExtensionId,
  enableTestMode,
  openDemoPage,
  shadowHasClass,
  shadowText,
  shadowClick,
  shadowIsVisible,
} from "./helpers";

let browser: Browser;
let page: Page;
let extensionId: string;

/** Focus a textarea and open the popup card. */
async function openPopupOnTextarea(p: Page, selector = "textarea") {
  // Click outside first to reset state
  await p.click("header");
  await new Promise((r) => setTimeout(r, 400));

  // Focus the textarea
  await p.click(selector);
  await new Promise((r) => setTimeout(r, 400));

  // Verify icon appeared
  const iconVisible = await shadowHasClass(p, ".wg-floating-icon", "wg-visible");
  if (!iconVisible) {
    // Type something to make sure the field is focused
    await p.keyboard.type(" ");
    await new Promise((r) => setTimeout(r, 300));
  }

  // Click the W icon to open popup
  await shadowClick(p, ".wg-floating-icon");
  await new Promise((r) => setTimeout(r, 400));
}

async function clickTextareaByIndex(p: Page, index: number) {
  const textareas = await p.$$("textarea");
  const target = textareas[index];
  if (!target) {
    throw new Error(`Missing textarea at index ${index}`);
  }

  await target.click();
  await new Promise((r) => setTimeout(r, 400));
}

async function openPopupOnTextareaIndex(p: Page, index: number) {
  await p.click("header");
  await new Promise((r) => setTimeout(r, 400));

  await clickTextareaByIndex(p, index);

  const iconVisible = await shadowHasClass(p, ".wg-floating-icon", "wg-visible");
  if (!iconVisible) {
    await p.keyboard.type(" ");
    await new Promise((r) => setTimeout(r, 300));
  }

  await shadowClick(p, ".wg-floating-icon");
  await new Promise((r) => setTimeout(r, 400));
}

describe("WriteGooderer E2E", () => {
  beforeAll(async () => {
    browser = await launchBrowser();
    extensionId = await getExtensionId(browser);
    await enableTestMode(browser);
    page = await openDemoPage(browser);
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  describe("Field Detection", () => {
    it("shows the W icon when focusing a standard textarea", async () => {
      await page.click("textarea");
      await new Promise((r) => setTimeout(r, 300));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(true);
    });

    it("hides the W icon when clicking outside", async () => {
      await page.click("header");
      await new Promise((r) => setTimeout(r, 400));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(false);
    });

    it("does NOT show icon on password input", async () => {
      await page.click('input[type="password"]');
      await new Promise((r) => setTimeout(r, 300));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(false);
    });

    it("does NOT show icon on search input", async () => {
      await page.click('input[type="search"]');
      await new Promise((r) => setTimeout(r, 300));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(false);
    });

    it("does NOT show icon on email input", async () => {
      await page.click('input[type="email"]');
      await new Promise((r) => setTimeout(r, 300));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(false);
    });

    it("shows icon on contenteditable div", async () => {
      await page.click('[contenteditable="true"]');
      await new Promise((r) => setTimeout(r, 300));

      const hasVisible = await shadowHasClass(
        page,
        ".wg-floating-icon",
        "wg-visible"
      );
      expect(hasVisible).toBe(true);
    });
  });

  describe("Popup Card", () => {
    it("opens the popup when clicking the W icon", async () => {
      await openPopupOnTextarea(page);

      const popupVisible = await shadowHasClass(
        page,
        ".wg-popup-card",
        "wg-visible"
      );
      expect(popupVisible).toBe(true);
    });

    it("shows WriteGooderer title in the popup header", async () => {
      const title = await shadowText(page, ".wg-popup-title");
      expect(title).toBe("WriteGooderer");
    });

    it("shows Proofread and Change Tone buttons", async () => {
      const buttons = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host || !host.shadowRoot) return [];
        const btns = host.shadowRoot.querySelectorAll(
          ".wg-popup-actions .wg-btn"
        );
        return Array.from(btns).map((b) => b.textContent);
      });
      expect(buttons).toContain("Proofread");
      expect(buttons).toContain("Change Tone");
    });

    it("shows the footer text", async () => {
      const footer = await shadowText(page, ".wg-popup-footer");
      expect(footer).toBe("Powered by your own computer");
    });

    it("closes when clicking the X button", async () => {
      await shadowClick(page, ".wg-close-btn");
      await new Promise((r) => setTimeout(r, 300));

      const popupVisible = await shadowHasClass(
        page,
        ".wg-popup-card",
        "wg-visible"
      );
      expect(popupVisible).toBe(false);
    });

    it("assigns unique ids to textareas and closes the popup when focus changes", async () => {
      await openPopupOnTextareaIndex(page, 0);

      const before = await page.evaluate(() => {
        const textareas = Array.from(document.querySelectorAll("textarea"));
        const popup = document
          .querySelector("#writegooderer-root")
          ?.shadowRoot?.querySelector(".wg-popup-card") as HTMLElement | null;

        return {
          firstId: textareas[0]?.getAttribute("data-wg-field-id"),
          secondId: textareas[1]?.getAttribute("data-wg-field-id"),
          popupVisible: popup?.classList.contains("wg-visible") ?? false,
        };
      });

      expect(before.popupVisible).toBe(true);

      await clickTextareaByIndex(page, 1);

      const after = await page.evaluate(() => {
        const textareas = Array.from(document.querySelectorAll("textarea"));
        const popup = document
          .querySelector("#writegooderer-root")
          ?.shadowRoot?.querySelector(".wg-popup-card") as HTMLElement | null;

        return {
          firstId: textareas[0]?.getAttribute("data-wg-field-id"),
          secondId: textareas[1]?.getAttribute("data-wg-field-id"),
          popupVisible: popup?.classList.contains("wg-visible") ?? false,
        };
      });

      expect(before.firstId).toMatch(/^wg-field-\d+$/);
      expect(before.secondId).toMatch(/^wg-field-\d+$/);
      expect(before.firstId).not.toBe(before.secondId);
      expect(after.firstId).toBe(before.firstId);
      expect(after.secondId).toBe(before.secondId);
      expect(after.popupVisible).toBe(false);
    });
  });

  describe("Proofreading", () => {
    it("shows score and diff after proofreading", async () => {
      // Fresh popup open on the first textarea
      await openPopupOnTextarea(page);

      // Verify popup is open
      const popupOpen = await shadowHasClass(page, ".wg-popup-card", "wg-visible");
      expect(popupOpen).toBe(true);

      // Click Proofread (first .wg-btn-primary in .wg-popup-actions)
      await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        const btn = host?.shadowRoot?.querySelector(".wg-popup-actions .wg-btn-primary") as HTMLElement;
        btn?.click();
      });

      // Wait for mock AI response
      await new Promise((r) => setTimeout(r, 3000));

      // Check for error first
      const errorText = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return null;
        return host.shadowRoot.querySelector(".wg-error")?.textContent ?? null;
      });

      // Score display should be visible (style.display should be "block")
      const scoreStyle = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return null;
        return host.shadowRoot.querySelector(".wg-score-display")?.getAttribute("style");
      });

      if (errorText) {
        console.log("[DEBUG] Got error:", errorText);
      }
      console.log("[DEBUG] Score display style:", scoreStyle);

      // If there's an error, the test should report the actual error
      expect(errorText).toBeNull();
      expect(scoreStyle).toContain("block");
    });

    it("displays score number and tier label", async () => {
      const scoreText = await shadowText(page, ".wg-score-number");
      expect(scoreText).toBeTruthy();
      const score = parseInt(scoreText!, 10);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);

      const tierText = await shadowText(page, ".wg-tier-label");
      expect(tierText).toBeTruthy();
    });

    it("restores a textarea's score when refocusing it", async () => {
      await openPopupOnTextareaIndex(page, 0);

      await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        const btn = host?.shadowRoot?.querySelector(".wg-popup-actions .wg-btn-primary") as
          | HTMLElement
          | null;
        btn?.click();
      });

      await new Promise((r) => setTimeout(r, 3000));

      const firstScore = await page.evaluate(() => {
        const scoreEl = document
          .querySelector("#writegooderer-root")
          ?.shadowRoot?.querySelector(".wg-floating-score") as HTMLElement | null;

        return {
          text: scoreEl?.textContent ?? null,
          display: scoreEl?.style.display ?? null,
        };
      });

      expect(firstScore.display).toBe("flex");
      expect(firstScore.text).toBeTruthy();

      await clickTextareaByIndex(page, 1);

      const secondScore = await page.evaluate(() => {
        const scoreEl = document
          .querySelector("#writegooderer-root")
          ?.shadowRoot?.querySelector(".wg-floating-score") as HTMLElement | null;

        return scoreEl?.style.display ?? null;
      });

      expect(secondScore).toBe("none");

      await clickTextareaByIndex(page, 0);

      const restoredScore = await page.evaluate(() => {
        const scoreEl = document
          .querySelector("#writegooderer-root")
          ?.shadowRoot?.querySelector(".wg-floating-score") as HTMLElement | null;

        return {
          text: scoreEl?.textContent ?? null,
          display: scoreEl?.style.display ?? null,
        };
      });

      expect(restoredScore.display).toBe("flex");
      expect(restoredScore.text).toBe(firstScore.text);
    });

    it("shows diff with additions and removals", async () => {
      const diffVisible = await shadowIsVisible(page, ".wg-diff-view");
      expect(diffVisible).toBe(true);

      const hasDiffMarkers = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return false;
        const removes = host.shadowRoot.querySelectorAll(".wg-diff-remove");
        const adds = host.shadowRoot.querySelectorAll(".wg-diff-add");
        return removes.length > 0 && adds.length > 0;
      });
      expect(hasDiffMarkers).toBe(true);
    });

    it('shows "Accept All" button', async () => {
      const acceptBtn = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return null;
        const btns = host.shadowRoot.querySelectorAll(
          ".wg-diff-actions .wg-btn-primary"
        );
        for (const b of btns) {
          if (b.textContent === "Accept All") return b.textContent;
        }
        return null;
      });
      expect(acceptBtn).toBe("Accept All");
    });
  });

  describe("Tone Selector", () => {
    it("shows 8 tone options when clicking Change Tone", async () => {
      // Fresh popup
      await openPopupOnTextarea(page);

      // Click Change Tone (secondary button)
      await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        const btn = host?.shadowRoot?.querySelector(".wg-popup-actions .wg-btn-secondary") as HTMLElement;
        btn?.click();
      });
      await new Promise((r) => setTimeout(r, 300));

      const toneCount = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return 0;
        return host.shadowRoot.querySelectorAll(".wg-tone-btn").length;
      });
      expect(toneCount).toBe(8);
    });

    it("shows all expected tone names", async () => {
      const toneNames = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return [];
        const names = host.shadowRoot.querySelectorAll(".wg-tone-name");
        return Array.from(names).map((n) => n.textContent);
      });

      expect(toneNames).toContain("Professional");
      expect(toneNames).toContain("Casual");
      expect(toneNames).toContain("LinkedIn Influencer");
      expect(toneNames).toContain("Passive Aggressive");
      expect(toneNames).toContain("Corporate Buzzword");
    });

    it("shows rewritten text after selecting a tone", async () => {
      // Click a tone button
      await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return;
        const btn = host.shadowRoot.querySelector(".wg-tone-btn") as HTMLElement;
        btn?.click();
      });

      // Wait for mock AI response
      await new Promise((r) => setTimeout(r, 3000));

      const errorText = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return null;
        return host.shadowRoot.querySelector(".wg-error")?.textContent ?? null;
      });

      if (errorText) {
        console.log("[DEBUG] Tone rewrite error:", errorText);
      }
      expect(errorText).toBeNull();

      const rewriteVisible = await shadowIsVisible(page, ".wg-rewrite-result");
      expect(rewriteVisible).toBe(true);

      // Should have Apply and Copy buttons
      const buttons = await page.evaluate(() => {
        const host = document.querySelector("#writegooderer-root");
        if (!host?.shadowRoot) return [];
        const btns = host.shadowRoot.querySelectorAll(
          ".wg-rewrite-result .wg-btn"
        );
        return Array.from(btns).map((b) => b.textContent);
      });
      expect(buttons).toContain("Apply");
      expect(buttons).toContain("Copy");
    });
  });

  describe("Toolbar Popup", () => {
    it("opens with correct title", async () => {
      const popupPage = await browser.newPage();
      await popupPage.goto(
        `chrome-extension://${extensionId}/popup.html`,
        { waitUntil: "domcontentloaded" }
      );

      const title = await popupPage.$eval(
        ".popup-title",
        (el) => el.textContent
      );
      expect(title).toBe("WriteGooderer");
      await popupPage.close();
    });

    it("shows model status indicator", async () => {
      const popupPage = await browser.newPage();
      await popupPage.goto(
        `chrome-extension://${extensionId}/popup.html`,
        { waitUntil: "domcontentloaded" }
      );
      await new Promise((r) => setTimeout(r, 500));

      const statusText = await popupPage.$eval(
        "#statusText",
        (el) => el.textContent
      );
      // In test environment, self.ai is not available so status shows "Unavailable"
      expect(statusText).toBe("Unavailable");
      await popupPage.close();
    });

    it("shows the site toggle switch", async () => {
      const popupPage = await browser.newPage();
      await popupPage.goto(
        `chrome-extension://${extensionId}/popup.html`,
        { waitUntil: "domcontentloaded" }
      );

      const toggleExists = await popupPage.$("#siteToggle");
      expect(toggleExists).toBeTruthy();
      await popupPage.close();
    });

    it("shows the footer tagline", async () => {
      const popupPage = await browser.newPage();
      await popupPage.goto(
        `chrome-extension://${extensionId}/popup.html`,
        { waitUntil: "domcontentloaded" }
      );

      const footer = await popupPage.$eval(
        ".popup-footer p",
        (el) => el.textContent
      );
      expect(footer).toBe(
        "100% local. 0% cloud. Infinitely gooderer."
      );
      await popupPage.close();
    });
  });
});
