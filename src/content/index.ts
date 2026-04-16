import { isSiteDisabled } from "../shared/storage";
import { checkTestMode, destroySessions, prewarmSessions } from "./ai-client";
import { ensureFieldId, initFieldDetector } from "./field-detector";
import { FloatingIcon } from "./floating-icon";
import { PopupCard } from "./popup-card";

const INIT_FLAG = "__writegoodererInitialized";

function logDebug(message: string): void {
  console.debug(`[WriteGooderer] ${message}`);
}

async function main() {
  // Check if extension is disabled on this site
  if (await isSiteDisabled(window.location.hostname)) return;

  const globalWindow = window as Window & { [INIT_FLAG]?: boolean };
  if (globalWindow[INIT_FLAG] || document.getElementById("writegooderer-root")) {
    logDebug("Skipping duplicate content-script initialization");
    return;
  }
  globalWindow[INIT_FLAG] = true;

  // Check if test mode is enabled (for E2E tests)
  await checkTestMode();

  // Create Shadow DOM container
  const host = document.createElement("div");
  host.id = "writegooderer-root";
  host.style.cssText = "position:absolute;top:0;left:0;z-index:2147483647;pointer-events:none;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles
  const style = document.createElement("style");
  style.textContent = CSS_TEXT;
  shadow.appendChild(style);

  let activeField: HTMLElement | null = null;
  const fieldScores = new Map<string, { score: number; color: string }>();

  // Init floating icon
  const icon = new FloatingIcon(shadow, () => {
    if (activeField) {
      if (popup.isVisible) {
        popup.hide();
      } else {
        popup.show(activeField);
      }
    }
  });

  // Init popup card
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

  // Init field detector
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
      void destroySessions().catch(() => {});
    },
    { once: true }
  );
}

// All CSS injected into Shadow DOM
const CSS_TEXT = `
/* ===== Design Tokens ===== */
:host {
  --wg-gradient: linear-gradient(135deg, #ff8a57 0%, #ffb36b 100%);
  --wg-bg-soft: linear-gradient(145deg, #fff0e3 0%, #fffaf4 100%);
  --wg-bg-muted: #fffaf6;
  --wg-text: #2f211a;
  --wg-text-secondary: #755a4a;
  --wg-border: rgba(190, 141, 109, 0.24);
  --wg-card-bg: rgba(255, 252, 248, 0.96);
  --wg-shadow: 0 24px 54px rgba(110, 70, 43, 0.18);
  --wg-radius: 18px;
  --wg-font: "Avenir Next", "Segoe UI", sans-serif;
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
    radial-gradient(circle at top left, rgba(255,255,255,0.38), transparent 42%),
    var(--wg-gradient);
  color: white;
  font-family: var(--wg-font);
  font-size: 15px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  box-shadow: 0 14px 24px rgba(163, 97, 38, 0.28);
  z-index: 2147483647;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(8px);
}

.wg-floating-icon.wg-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.wg-floating-icon:hover {
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 18px 26px rgba(163, 97, 38, 0.34);
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
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);
  border: 2px solid rgba(255, 250, 246, 0.96);
}

/* ===== Popup Card ===== */
.wg-popup-card {
  position: absolute;
  width: 360px;
  max-height: 520px;
  background:
    radial-gradient(circle at top right, rgba(255, 219, 188, 0.45), transparent 28%),
    var(--wg-card-bg);
  border-radius: var(--wg-radius);
  box-shadow: var(--wg-shadow);
  border: 1px solid var(--wg-border);
  font-family: var(--wg-font);
  color: var(--wg-text);
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 2147483647;
  backdrop-filter: blur(18px);
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
  border-bottom: 1px solid var(--wg-border);
}

.wg-popup-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.wg-popup-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a26640;
}

.wg-popup-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--wg-text);
}

.wg-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
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
  background: rgba(255, 255, 255, 0.96);
  transform: rotate(90deg);
}

.wg-popup-body {
  padding: 16px;
  max-height: 380px;
  overflow-y: auto;
}

.wg-empty-state {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,246,239,0.88) 100%);
  border: 1px solid rgba(190, 141, 109, 0.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

.wg-empty-eyebrow {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 138, 87, 0.12);
  color: #a45b2d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wg-empty-title {
  margin-top: 10px;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 800;
  color: var(--wg-text);
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
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(190, 141, 109, 0.2);
  font-size: 11px;
  font-weight: 700;
  color: #8e5c3b;
}

.wg-popup-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px 14px;
  border-top: 1px solid var(--wg-border);
  background: rgba(255, 250, 246, 0.82);
}

.wg-popup-footer {
  padding: 10px 16px 12px;
  text-align: center;
  font-size: 11px;
  color: var(--wg-text-secondary);
  border-top: 1px solid var(--wg-border);
  background: rgba(255, 246, 239, 0.74);
}

/* ===== Buttons ===== */
.wg-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 12px;
  font-family: var(--wg-font);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.wg-btn-primary {
  background: var(--wg-gradient);
  color: white;
}
.wg-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(163, 97, 38, 0.24);
}

.wg-btn-secondary {
  background: rgba(255, 255, 255, 0.86);
  color: var(--wg-text);
  border-color: var(--wg-border);
}
.wg-btn-secondary:hover {
  background: rgba(255, 244, 235, 0.96);
  border-color: rgba(190, 141, 109, 0.4);
}

/* ===== Score Display ===== */
.wg-score-display {
  text-align: center;
  margin-bottom: 12px;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,247,241,0.92) 100%);
  border: 1px solid rgba(190, 141, 109, 0.18);
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
  stroke: #f3e7dc;
  stroke-width: 8;
}

.wg-gauge-fill {
  fill: none;
  stroke: #4ECDC4;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  transition: stroke 0.3s ease;
}

.wg-score-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: var(--wg-text);
}

.wg-tier-label {
  font-size: 14px;
  font-weight: 700;
}

/* ===== Loading ===== */
.wg-loading-state {
  text-align: center;
  padding: 18px 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,247,241,0.86) 100%);
  border: 1px solid rgba(190, 141, 109, 0.18);
}

.wg-progress-bar {
  height: 6px;
  background: #f3e7dc;
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
  background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,247,241,0.9) 100%);
  border-radius: 14px;
  border: 1px solid rgba(190, 141, 109, 0.18);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 180px;
  overflow-y: auto;
}

.wg-diff-remove {
  background: #FFE0E0;
  color: #CC3333;
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 2px;
}

.wg-diff-add {
  background: #DFFFDF;
  color: #2E8B2E;
  border-radius: 2px;
  padding: 0 2px;
}

.wg-diff-perfect {
  color: #2ECC71;
  font-size: 13px;
  text-align: center;
  padding: 8px;
  font-weight: 700;
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
  border: 1px solid rgba(190, 141, 109, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--wg-font);
  text-align: left;
}

.wg-tone-btn:hover {
  border-color: #ff9c66;
  background: rgba(255, 241, 230, 0.98);
}

.wg-tone-btn.wg-tone-selected {
  border-color: #ff9c66;
  background: linear-gradient(135deg, #fff0e3 0%, #fff9f2 100%);
  box-shadow: 0 0 0 1px rgba(255, 156, 102, 0.4);
}

.wg-tone-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--wg-text);
}

.wg-tone-sub {
  font-size: 10px;
  color: var(--wg-text-secondary);
  margin-top: 1px;
}

/* ===== Rewrite Result ===== */
.wg-rewrite-result {
  margin-top: 12px;
}

.wg-rewrite-text {
  font-size: 13px;
  line-height: 1.6;
  padding: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,247,241,0.9) 100%);
  border-radius: 14px;
  border: 1px solid rgba(190, 141, 109, 0.18);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

/* ===== Error ===== */
.wg-error {
  color: #CC3333;
  font-size: 13px;
  text-align: center;
  padding: 14px;
  background: linear-gradient(180deg, #fff5f3 0%, #fff0ed 100%);
  border-radius: 14px;
  border: 1px solid #ffd8d2;
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
