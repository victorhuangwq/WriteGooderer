import { isSiteDisabled } from "../shared/storage";
import { checkTestMode } from "./ai-client";
import { initFieldDetector } from "./field-detector";
import { FloatingIcon } from "./floating-icon";
import { PopupCard } from "./popup-card";

async function main() {
  // Check if extension is disabled on this site
  if (await isSiteDisabled(window.location.hostname)) return;

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
    (score, color) => icon.showScore(score, color)
  );

  // Init field detector
  initFieldDetector((field) => {
    activeField = field;
    if (field) {
      icon.show(field);
    } else {
      // Don't hide if popup is open
      if (!popup.isVisible) {
        icon.hide();
        icon.hideScore();
      }
    }
  });
}

// All CSS injected into Shadow DOM
const CSS_TEXT = `
/* ===== Design Tokens ===== */
:host {
  --wg-gradient: linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%);
  --wg-bg-soft: linear-gradient(135deg, #FFF5F5 0%, #FFF8F0 100%);
  --wg-text: #2D3436;
  --wg-text-secondary: #636E72;
  --wg-border: #E8E8E8;
  --wg-card-bg: #FFFFFF;
  --wg-shadow: 0 4px 20px rgba(0,0,0,0.10);
  --wg-radius: 12px;
  --wg-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== Floating Icon ===== */
.wg-floating-icon {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--wg-gradient);
  color: white;
  font-family: var(--wg-font);
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(254,107,139,0.3);
  z-index: 2147483647;
  user-select: none;
}

.wg-floating-icon.wg-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.wg-floating-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 14px rgba(254,107,139,0.4);
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
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  color: white;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* ===== Popup Card ===== */
.wg-popup-card {
  position: absolute;
  width: 360px;
  max-height: 520px;
  background: var(--wg-card-bg);
  border-radius: var(--wg-radius);
  box-shadow: var(--wg-shadow);
  border: 1px solid var(--wg-border);
  font-family: var(--wg-font);
  color: var(--wg-text);
  overflow: hidden;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 2147483647;
}

.wg-popup-card.wg-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.wg-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--wg-bg-soft);
  border-bottom: 1px solid var(--wg-border);
}

.wg-popup-title {
  font-size: 14px;
  font-weight: 700;
  background: var(--wg-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wg-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--wg-text-secondary);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.wg-close-btn:hover { color: var(--wg-text); }

.wg-popup-body {
  padding: 16px;
  max-height: 380px;
  overflow-y: auto;
}

.wg-popup-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--wg-border);
}

.wg-popup-footer {
  padding: 8px 16px;
  text-align: center;
  font-size: 11px;
  color: var(--wg-text-secondary);
  border-top: 1px solid var(--wg-border);
}

/* ===== Buttons ===== */
.wg-btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: var(--wg-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.wg-btn-primary {
  background: var(--wg-gradient);
  color: white;
}
.wg-btn-primary:hover { opacity: 0.9; box-shadow: 0 2px 8px rgba(254,107,139,0.3); }

.wg-btn-secondary {
  background: #F5F5F5;
  color: var(--wg-text);
  border: 1px solid var(--wg-border);
}
.wg-btn-secondary:hover { background: #EBEBEB; }

/* ===== Score Display ===== */
.wg-score-display {
  text-align: center;
  margin-bottom: 12px;
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
  stroke: #F0F0F0;
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
  font-weight: 700;
  color: var(--wg-text);
}

.wg-tier-label {
  font-size: 14px;
  font-weight: 600;
}

/* ===== Loading ===== */
.wg-loading-state {
  text-align: center;
  padding: 16px 0;
}

.wg-progress-bar {
  height: 4px;
  background: #F0F0F0;
  border-radius: 2px;
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
  padding: 12px;
  background: #FAFAFA;
  border-radius: 8px;
  border: 1px solid var(--wg-border);
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
  gap: 6px;
}

.wg-tone-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 10px;
  border: 1px solid var(--wg-border);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--wg-font);
  text-align: left;
}

.wg-tone-btn:hover {
  border-color: #FE6B8B;
  background: #FFF5F5;
}

.wg-tone-btn.wg-tone-selected {
  border-color: #FE6B8B;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFF8F0 100%);
  box-shadow: 0 0 0 1px #FE6B8B;
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
  padding: 12px;
  background: #FAFAFA;
  border-radius: 8px;
  border: 1px solid var(--wg-border);
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
  padding: 12px;
  background: #FFF5F5;
  border-radius: 8px;
  border: 1px solid #FFE0E0;
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
