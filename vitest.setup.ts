import { chrome } from "vitest-chrome";

// Make chrome available globally, as it would be in a real extension
Object.assign(global, { chrome });

// Ensure chrome.storage.local methods return promises by default
chrome.storage.local.get.mockImplementation((_keys?: any) =>
  Promise.resolve({}) as any
);
chrome.storage.local.set.mockImplementation((_items: any) =>
  Promise.resolve() as any
);
