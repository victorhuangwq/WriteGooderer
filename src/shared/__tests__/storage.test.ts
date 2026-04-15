import { describe, it, expect, beforeEach } from "vitest";
import { chrome } from "vitest-chrome";
import { getPreferences, setLastTone, isSiteDisabled, toggleSite } from "../storage";

describe("storage", () => {
  beforeEach(() => {
    chrome.storage.local.get.mockReset();
    chrome.storage.local.set.mockReset();
    chrome.storage.local.get.mockImplementation(() => Promise.resolve({}) as any);
    chrome.storage.local.set.mockImplementation(() => Promise.resolve() as any);
  });

  describe("getPreferences", () => {
    it("returns defaults when storage is empty", async () => {
      const prefs = await getPreferences();
      expect(prefs.lastTone).toBe("professional");
      expect(prefs.disabledSites).toEqual([]);
    });

    it("merges stored values with defaults", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ lastTone: "casual" }) as any
      );
      const prefs = await getPreferences();
      expect(prefs.lastTone).toBe("casual");
      expect(prefs.disabledSites).toEqual([]);
    });

    it("returns stored disabledSites", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ disabledSites: ["example.com"] }) as any
      );
      const prefs = await getPreferences();
      expect(prefs.disabledSites).toEqual(["example.com"]);
    });
  });

  describe("setLastTone", () => {
    it("saves the tone to storage", async () => {
      await setLastTone("linkedin-influencer");
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        lastTone: "linkedin-influencer",
      });
    });
  });

  describe("isSiteDisabled", () => {
    it("returns false when site is not in disabled list", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ disabledSites: ["other.com"] }) as any
      );
      expect(await isSiteDisabled("example.com")).toBe(false);
    });

    it("returns true when site is in disabled list", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ disabledSites: ["example.com", "other.com"] }) as any
      );
      expect(await isSiteDisabled("example.com")).toBe(true);
    });

    it("returns false when disabled list is empty", async () => {
      expect(await isSiteDisabled("example.com")).toBe(false);
    });
  });

  describe("toggleSite", () => {
    it("adds site to disabled list when not present", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ disabledSites: [] }) as any
      );
      const wasEnabled = await toggleSite("example.com");
      expect(wasEnabled).toBe(false); // was NOT re-enabled, it was disabled
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        disabledSites: ["example.com"],
      });
    });

    it("removes site from disabled list when present", async () => {
      chrome.storage.local.get.mockImplementation(() =>
        Promise.resolve({ disabledSites: ["example.com", "other.com"] }) as any
      );
      const wasEnabled = await toggleSite("example.com");
      expect(wasEnabled).toBe(true); // was re-enabled
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        disabledSites: ["other.com"],
      });
    });
  });
});
