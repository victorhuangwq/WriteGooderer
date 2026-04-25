(function() {
  "use strict";
  const DEFAULTS = {
    lastTone: "professional",
    disabledSites: []
  };
  async function getPreferences() {
    const keys = Object.keys(DEFAULTS);
    const result = await chrome.storage.local.get(keys);
    return { ...DEFAULTS, ...result };
  }
  async function isSiteDisabled(hostname) {
    const prefs = await getPreferences();
    return prefs.disabledSites.includes(hostname);
  }
  async function toggleSite(hostname) {
    const prefs = await getPreferences();
    const idx = prefs.disabledSites.indexOf(hostname);
    if (idx >= 0) {
      prefs.disabledSites.splice(idx, 1);
    } else {
      prefs.disabledSites.push(hostname);
    }
    await chrome.storage.local.set({ disabledSites: prefs.disabledSites });
    return idx >= 0;
  }
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const statusHint = document.getElementById("statusHint");
  const siteToggle = document.getElementById("siteToggle");
  function renderReady() {
    statusDot.className = "status-dot status-ready";
    statusText.textContent = "Ready in this Chrome build";
    statusHint.textContent = "The Prompt API is available, so proofread and tone rewrites run locally.";
  }
  function renderDownloading() {
    statusDot.className = "status-dot status-ready";
    statusText.textContent = "Model downloading";
    statusHint.textContent = "Chrome is downloading Gemini Nano in the background. It'll be ready shortly.";
  }
  function renderDownloadable() {
    statusDot.className = "status-dot status-ready";
    statusText.textContent = "Ready to download";
    statusHint.textContent = "The Prompt API is enabled; the model will download on first use.";
  }
  function renderError() {
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
  async function detectModel() {
    const LM = self.LanguageModel ?? self.ai?.languageModel ?? null;
    if (!LM || typeof LM.availability !== "function") return "unavailable";
    try {
      const status = await LM.availability();
      if (status === "available" || status === "downloadable" || status === "downloading" || status === "unavailable") {
        return status;
      }
      return "unavailable";
    } catch {
      return "unavailable";
    }
  }
  async function init() {
    const status = await detectModel();
    if (status === "available") {
      renderReady();
    } else if (status === "downloading") {
      renderDownloading();
    } else if (status === "downloadable") {
      renderDownloadable();
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
          statusHint.textContent = "WriteGooderer does not run on special Chrome pages.";
        }
      }
    }
  }
  init();
})();
