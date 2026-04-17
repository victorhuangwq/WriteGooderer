import { isSiteDisabled, toggleSite } from "../shared/storage";

const statusDot = document.getElementById("statusDot")!;
const statusText = document.getElementById("statusText")!;
const statusHint = document.getElementById("statusHint")!;
const siteToggle = document.getElementById("siteToggle") as HTMLInputElement;

function renderReady(): void {
  statusDot.className = "status-dot status-ready";
  statusText.textContent = "Ready in this Chrome build";
  statusHint.textContent =
    "The Prompt API is available, so proofread and tone rewrites run locally.";
}

function renderError(): void {
  statusDot.className = "status-dot status-error";
  statusText.textContent = "Prompt API unavailable";
  statusHint.innerHTML = "";

  const list = document.createElement("ol");

  const flagsItem = document.createElement("li");
  flagsItem.append('Enable "Prompt API for Gemini Nano" in ');
  const flagsBtn = document.createElement("button");
  flagsBtn.className = "status-link";
  flagsBtn.type = "button";
  flagsBtn.textContent = "chrome://flags";
  flagsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://flags/#prompt-api-for-gemini-nano" });
  });
  flagsItem.append(flagsBtn, ".");

  const componentsItem = document.createElement("li");
  componentsItem.append("Update the on-device model in ");
  const componentsBtn = document.createElement("button");
  componentsBtn.className = "status-link";
  componentsBtn.type = "button";
  componentsBtn.textContent = "chrome://components";
  componentsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://components" });
  });
  componentsItem.append(componentsBtn, ".");

  list.append(flagsItem, componentsItem);
  statusHint.appendChild(list);
}

async function init() {
  const ai = (self as any).ai;
  if (ai?.languageModel) {
    renderReady();
  } else {
    renderError();
  }

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
      siteToggle.disabled = true;
      if (!statusHint.textContent?.trim() && !statusHint.childElementCount) {
        statusHint.textContent =
          "WriteGooderer does not run on special Chrome pages.";
      }
    }
  }
}

init();
