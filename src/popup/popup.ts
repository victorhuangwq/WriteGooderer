import { sendMessage } from "../shared/messages";
import type { ModelStatusResponse } from "../shared/messages";
import { isSiteDisabled, toggleSite } from "../shared/storage";

const statusDot = document.getElementById("statusDot")!;
const statusText = document.getElementById("statusText")!;
const statusHint = document.getElementById("statusHint")!;
const siteToggle = document.getElementById("siteToggle") as HTMLInputElement;

async function init() {
  // Check model status
  try {
    const response = await sendMessage<ModelStatusResponse>({
      type: "GET_MODEL_STATUS",
    });

    switch (response.status) {
      case "ready":
        statusDot.className = "status-dot status-ready";
        statusText.textContent = "Ready";
        statusHint.textContent = "";
        break;
      case "loading":
        statusDot.className = "status-dot status-loading";
        statusText.textContent = "Loading model...";
        statusHint.textContent = "The AI model is warming up.";
        break;
      case "unavailable":
        statusDot.className = "status-dot status-error";
        statusText.textContent = "Unavailable";
        statusHint.textContent =
          'Enable "Prompt API for Gemini Nano" in chrome://flags and update the model in chrome://components.';
        break;
      case "error":
        statusDot.className = "status-dot status-error";
        statusText.textContent = "Error";
        statusHint.textContent = response.error || "Something went wrong.";
        break;
    }
  } catch {
    statusDot.className = "status-dot status-error";
    statusText.textContent = "Error";
    statusHint.textContent = "Could not reach the service worker.";
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
