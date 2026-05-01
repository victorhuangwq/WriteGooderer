console.log("[WriteGooderer] Service worker loaded");
const OFFSCREEN_URL = "offscreen.html";
let creatingOffscreen = null;
async function hasOffscreen() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)]
  });
  return contexts.length > 0;
}
async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["WORKERS"],
    justification: "Hosts a single shared on-device language-model session so all tabs share one set of weights and KV-cache."
  }).finally(() => {
    creatingOffscreen = null;
  });
  await creatingOffscreen;
}
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "wg/ensure-offscreen") return false;
  ensureOffscreen().then(
    () => sendResponse({ ok: true }),
    (err) => sendResponse({ ok: false, error: String(err) })
  );
  return true;
});
