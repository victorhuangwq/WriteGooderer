import type { TonePreset, UserPreferences } from "./types";

const DEFAULTS: UserPreferences = {
  lastTone: "professional",
  disabledSites: [],
};

export async function getPreferences(): Promise<UserPreferences> {
  const keys = Object.keys(DEFAULTS);
  const result = await chrome.storage.local.get(keys);
  return { ...DEFAULTS, ...result } as UserPreferences;
}

export async function setLastTone(tone: TonePreset): Promise<void> {
  await chrome.storage.local.set({ lastTone: tone });
}

export async function isSiteDisabled(hostname: string): Promise<boolean> {
  const prefs = await getPreferences();
  return prefs.disabledSites.includes(hostname);
}

export async function toggleSite(hostname: string): Promise<boolean> {
  const prefs = await getPreferences();
  const idx = prefs.disabledSites.indexOf(hostname);
  if (idx >= 0) {
    prefs.disabledSites.splice(idx, 1);
  } else {
    prefs.disabledSites.push(hostname);
  }
  await chrome.storage.local.set({ disabledSites: prefs.disabledSites });
  return idx >= 0; // returns true if site was re-enabled
}
