import { chrome } from "vitest-chrome";
import { vi } from "vitest";

// Make chrome available globally, as it would be in a real extension
Object.assign(global, { chrome });

// Ensure chrome.storage.local methods return promises by default
chrome.storage.local.get.mockImplementation((_keys?: any) =>
  Promise.resolve({}) as any
);
chrome.storage.local.set.mockImplementation((_items: any) =>
  Promise.resolve() as any
);

// Ensure chrome.runtime.sendMessage returns a promise by default
chrome.runtime.sendMessage.mockImplementation((_message: any) =>
  Promise.resolve({}) as any
);
