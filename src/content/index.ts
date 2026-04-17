import { isSiteDisabled } from "../shared/storage";
import {
  FONT_TOKENS_CSS,
  tokensToCssVars,
  type ThemeMode,
} from "../shared/design-tokens";
import { checkTestMode, destroySessions, prewarmSessions } from "./ai-client";
import { ensureFieldId, initFieldDetector } from "./field-detector";
import { FloatingIcon } from "./floating-icon";
import { PopupCard } from "./popup-card";

const INIT_FLAG = "__writegoodererInitialized";
const FONT_STYLE_ID = "writegooderer-fonts";

function logDebug(message: string): void {
  console.debug(`[WriteGooderer] ${message}`);
}

function parseRgb(input: string): [number, number, number, number] | null {
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((p) => parseFloat(p.trim()));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [r, g, b] = parts;
  const a = parts.length >= 4 ? parts[3] : 1;
  return [r, g, b, a];
}

function detectHostTheme(): ThemeMode {
  try {
    const candidates = [document.body, document.documentElement].filter(
      (el): el is HTMLElement => !!el
    );
    for (const el of candidates) {
      const bg = getComputedStyle(el).backgroundColor;
      const rgb = parseRgb(bg);
      if (rgb && rgb[3] > 0.1) {
        const luma = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        return luma < 0.4 ? "dark" : "light";
      }
    }
  } catch {
    // fall through
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function injectFontFaces(): void {
  if (document.getElementById(FONT_STYLE_ID)) return;
  const interUrl = chrome.runtime.getURL("fonts/Inter-VariableFont.woff2");
  const frauncesUrl = chrome.runtime.getURL(
    "fonts/Fraunces-VariableFont.woff2"
  );
  const style = document.createElement("style");
  style.id = FONT_STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: "Inter";
      src: url("${interUrl}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("${frauncesUrl}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

async function main() {
  if (await isSiteDisabled(window.location.hostname)) return;

  const globalWindow = window as Window & { [INIT_FLAG]?: boolean };
  if (globalWindow[INIT_FLAG] || document.getElementById("writegooderer-root")) {
    logDebug("Skipping duplicate content-script initialization");
    return;
  }
  globalWindow[INIT_FLAG] = true;

  await checkTestMode();

  injectFontFaces();

  const host = document.createElement("div");
  host.id = "writegooderer-root";
  host.style.cssText =
    "position:absolute;top:0;left:0;z-index:2147483647;pointer-events:none;";
  host.setAttribute("data-wg-theme", detectHostTheme());
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = CSS_TEXT;
  shadow.appendChild(style);

  const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSchemeChange = () => {
    host.setAttribute("data-wg-theme", detectHostTheme());
  };
  darkMq.addEventListener?.("change", onSchemeChange);

  let activeField: HTMLElement | null = null;
  const fieldScores = new Map<string, { score: number; color: string }>();

  const icon = new FloatingIcon(shadow, () => {
    if (activeField) {
      if (popup.isVisible) {
        popup.hide();
      } else {
        popup.show(activeField);
      }
    }
  });

  const popup = new PopupCard(
    shadow,
    (loading) => icon.setLoading(loading),
    (field, score, color) => {
      const fieldId = ensureFieldId(field);
      fieldScores.set(fieldId, { score, color });

      if (activeField === field) {
        icon.showScore(score, color);
      }
    }
  );

  initFieldDetector(
    (field) => {
      activeField = field;
      if (field) {
        const fieldId = ensureFieldId(field);
        icon.show(field);

        const scoreState = fieldScores.get(fieldId);
        if (scoreState) {
          icon.showScore(scoreState.score, scoreState.color);
        } else {
          icon.hideScore();
        }

        if (popup.isVisible) {
          popup.attachToField(field);
        }
      } else if (!popup.isVisible) {
        icon.hide();
        icon.hideScore();
      } else {
        icon.hideScore();
      }
    },
    () => {
      logDebug("Valid field detected, prewarming AI sessions");
      void prewarmSessions().catch(() => {});
    }
  );

  window.addEventListener(
    "pagehide",
    () => {
      globalWindow[INIT_FLAG] = false;
      darkMq.removeEventListener?.("change", onSchemeChange);
      void destroySessions().catch(() => {});
    },
    { once: true }
  );
}

const CSS_TEXT = `
/* ===== Design Tokens ===== */
:host {
  ${FONT_TOKENS_CSS}
  ${tokensToCssVars("light")}
  --wg-radius: 18px;
}

:host([data-wg-theme="dark"]) {
  ${tokensToCssVars("dark")}
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== Floating Icon ===== */
.wg-floating-icon {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.42), transparent 48%),
    var(--wg-gradient);
  color: white;
  font-family: var(--wg-font-display);
  font-size: 20px;
  font-weight: 700;
  font-variation-settings: "opsz" 48, "SOFT" 60, "WONK" 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: none;
  box-shadow: var(--wg-icon-shadow);
  z-index: 2147483647;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(8px);
  line-height: 1;
}

.wg-floating-icon.wg-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.wg-floating-icon:hover {
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 18px 30px rgba(163, 97, 38, 0.38);
}

.wg-floating-icon.wg-loading {
  animation: wg-pulse 1s ease-in-out infinite;
}

@keyframes wg-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.wg-floating-score {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  color: white;
  font-family: var(--wg-font-body);
  font-size: 10px;
  font-weight: 700;
  font-feature-settings: "tnum" 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.22);
  border: 2px solid var(--wg-bg-muted);
}

/* ===== Popup Card ===== */
.wg-popup-card {
  position: absolute;
  width: 360px;
  max-height: 520px;
  background:
    radial-gradient(circle at top right, rgba(255, 219, 188, 0.28), transparent 28%),
    var(--wg-card-bg);
  border-radius: var(--wg-radius);
  box-shadow: var(--wg-shadow);
  border: 1px solid var(--wg-border);
  font-family: var(--wg-font-body);
  color: var(--wg-text);
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 2147483647;
  backdrop-filter: blur(18px);
  -webkit-font-smoothing: antialiased;
}

.wg-popup-card.wg-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.wg-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  background: var(--wg-bg-soft);
  border-bottom: 1px solid var(--wg-border-soft);
}

.wg-popup-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wg-popup-kicker {
  font-family: var(--wg-font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--wg-accent-strong);
}

.wg-popup-title {
  font-family: var(--wg-font-display);
  font-size: 17px;
  font-weight: 700;
  font-variation-settings: "opsz" 36, "SOFT" 50, "WONK" 1;
  color: var(--wg-text);
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.wg-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--wg-button-secondary-bg);
  border: none;
  font-size: 18px;
  color: var(--wg-text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}
.wg-close-btn:hover {
  color: var(--wg-text);
  background: var(--wg-button-secondary-hover-bg);
  transform: rotate(90deg);
}
.wg-close-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-popup-body {
  padding: 16px;
  max-height: 380px;
  overflow-y: auto;
}

.wg-empty-state {
  padding: 14px;
  border-radius: 16px;
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
  box-shadow: inset 0 1px 0 var(--wg-glass-highlight);
}

.wg-empty-eyebrow {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 138, 87, 0.14);
  color: var(--wg-accent-strong);
  font-family: var(--wg-font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.wg-empty-title {
  margin-top: 10px;
  font-family: var(--wg-font-display);
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
  font-variation-settings: "opsz" 36, "SOFT" 50, "WONK" 1;
  color: var(--wg-text);
  letter-spacing: -0.01em;
}

.wg-empty-copy {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--wg-text-secondary);
}

.wg-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.wg-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--wg-pill-bg);
  border: 1px solid var(--wg-border-soft);
  font-size: 11px;
  font-weight: 600;
  color: var(--wg-accent-soft);
  letter-spacing: 0.01em;
}

.wg-popup-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px 14px;
  border-top: 1px solid var(--wg-border-soft);
  background: var(--wg-bg-soft);
}

.wg-popup-footer {
  padding: 10px 16px 12px;
  text-align: center;
  font-size: 11px;
  color: var(--wg-text-tertiary);
  border-top: 1px solid var(--wg-border-soft);
  background: var(--wg-bg-soft);
}

/* ===== Buttons ===== */
.wg-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 12px;
  font-family: var(--wg-font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.wg-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-btn-primary {
  background: var(--wg-gradient);
  color: white;
  font-weight: 700;
}
.wg-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(163, 97, 38, 0.28);
}

.wg-btn-secondary {
  background: var(--wg-button-secondary-bg);
  color: var(--wg-text);
  border-color: var(--wg-border);
}
.wg-btn-secondary:hover {
  background: var(--wg-button-secondary-hover-bg);
  border-color: var(--wg-border);
}

/* ===== Score Display ===== */
.wg-score-display {
  text-align: center;
  margin-bottom: 12px;
  padding: 14px;
  border-radius: 16px;
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
}

.wg-gauge-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 8px;
}

.wg-gauge {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.wg-gauge-bg {
  fill: none;
  stroke: var(--wg-gauge-track);
  stroke-width: 8;
}

.wg-gauge-fill {
  fill: none;
  stroke: #4ECDC4;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  transition: stroke 0.3s ease, stroke-dashoffset 0.6s ease;
}

.wg-score-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--wg-font-display);
  font-size: 28px;
  font-weight: 700;
  font-variation-settings: "opsz" 48, "SOFT" 50, "WONK" 1;
  font-feature-settings: "tnum" 1;
  color: var(--wg-text);
  letter-spacing: -0.02em;
}

.wg-tier-label {
  font-family: var(--wg-font-display);
  font-size: 15px;
  font-weight: 700;
  font-variation-settings: "opsz" 24, "SOFT" 60, "WONK" 1;
  letter-spacing: -0.005em;
}

/* ===== Loading ===== */
.wg-loading-state {
  text-align: center;
  padding: 18px 14px;
  border-radius: 16px;
  background: var(--wg-surface-raised);
  border: 1px solid var(--wg-border-soft);
}

.wg-progress-bar {
  height: 6px;
  background: var(--wg-gauge-track);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.wg-progress-fill {
  height: 100%;
  width: 30%;
  background: var(--wg-gradient);
  border-radius: 2px;
  animation: wg-progress 1.5s ease-in-out infinite;
}

@keyframes wg-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

.wg-quip {
  font-size: 13px;
  color: var(--wg-text-secondary);
  font-style: italic;
  min-height: 20px;
}

.wg-quip-fade {
  animation: wg-fade-in 0.3s ease;
}

@keyframes wg-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Diff View ===== */
.wg-diff-view {
  margin-top: 12px;
}

.wg-diff-content {
  font-size: 13px;
  line-height: 1.6;
  padding: 14px;
  background: var(--wg-surface-raised);
  border-radius: 14px;
  border: 1px solid var(--wg-border-soft);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 180px;
  overflow-y: auto;
  color: var(--wg-text);
}

.wg-diff-remove {
  background: var(--wg-diff-remove-bg);
  color: var(--wg-diff-remove-fg);
  text-decoration: line-through;
  border-radius: 3px;
  padding: 0 3px;
}

.wg-diff-add {
  background: var(--wg-diff-add-bg);
  color: var(--wg-diff-add-fg);
  border-radius: 3px;
  padding: 0 3px;
  font-weight: 600;
}

.wg-diff-perfect {
  color: var(--wg-diff-add-fg);
  font-size: 13px;
  text-align: center;
  padding: 8px;
  font-weight: 600;
}

.wg-diff-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

/* ===== Tone Selector ===== */
.wg-tone-selector {
  margin-top: 8px;
}

.wg-tone-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.wg-tone-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 11px;
  border: 1px solid var(--wg-border-soft);
  border-radius: 14px;
  background: var(--wg-pill-bg);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  font-family: var(--wg-font-body);
  text-align: left;
}

.wg-tone-btn:hover {
  border-color: var(--wg-tone-selected-border);
  background: var(--wg-tone-hover-bg);
}

.wg-tone-btn:focus-visible {
  outline: 2px solid var(--wg-focus-ring);
  outline-offset: 2px;
}

.wg-tone-btn.wg-tone-selected {
  border-color: var(--wg-tone-selected-border);
  background: var(--wg-tone-selected-bg);
  box-shadow: 0 0 0 1px rgba(255, 156, 102, 0.4);
}

.wg-tone-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wg-text);
}

.wg-tone-sub {
  font-size: 10.5px;
  color: var(--wg-text-secondary);
  margin-top: 2px;
}

/* ===== Rewrite Result ===== */
.wg-rewrite-result {
  margin-top: 12px;
}

.wg-rewrite-text {
  font-size: 13px;
  line-height: 1.6;
  padding: 14px;
  background: var(--wg-surface-raised);
  border-radius: 14px;
  border: 1px solid var(--wg-border-soft);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  color: var(--wg-text);
}

/* ===== Error ===== */
.wg-error {
  color: var(--wg-error-fg);
  font-size: 13px;
  text-align: center;
  padding: 14px;
  background: var(--wg-error-bg);
  border-radius: 14px;
  border: 1px solid var(--wg-error-border);
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  .wg-floating-icon,
  .wg-popup-card,
  .wg-gauge-fill {
    transition: none;
  }
  .wg-floating-icon.wg-loading,
  .wg-progress-fill,
  .wg-quip-fade {
    animation: none;
  }
}
`;

// Start
main();
