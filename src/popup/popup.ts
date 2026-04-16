import { isSiteDisabled, toggleSite } from "../shared/storage";

const statusDot = document.getElementById("statusDot")!;
const statusText = document.getElementById("statusText")!;
const statusHint = document.getElementById("statusHint")!;
const siteToggle = document.getElementById("siteToggle") as HTMLInputElement;

async function init() {
  // Check if Chrome AI API is available
  const ai = (self as any).ai;
  if (ai?.languageModel) {
    statusDot.className = "status-dot status-ready";
    statusText.textContent = "Available";
    statusHint.textContent = "";
  } else {
    statusDot.className = "status-dot status-error";
    statusText.textContent = "Unavailable";
    statusHint.textContent =
      'Enable "Prompt API for Gemini Nano" in chrome://flags and update the model in chrome://components.';
  }

  // Site toggle
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const hostname = new URL(tab.url).hostname;
      const disabled = await isSiteDisabled(hostname);
      siteToggle.checked = !disabled;

      siteToggle.addEventListener("change", async () => {
        await toggleSite(hostname);
      });
    } catch {
      // chrome:// or other special pages
      siteToggle.disabled = true;
    }
  }
}

init();
