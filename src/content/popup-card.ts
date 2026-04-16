import { proofread, rewrite } from "./ai-client";
import { getTierForScore } from "../shared/constants";
import type { TonePreset } from "../shared/types";
import { ScoreDisplay } from "./score-display";
import { LoadingState } from "./loading-state";
import { DiffView } from "./diff-view";
import { ToneSelector } from "./tone-selector";

const POPUP_WIDTH = 360;
const POPUP_MAX_HEIGHT = 520;
const POPUP_GAP = 8;
const VIEWPORT_PADDING = 8;
const MIN_BODY_HEIGHT = 120;

export class PopupCard {
  private el: HTMLElement;
  private headerEl: HTMLElement;
  private bodyEl: HTMLElement;
  private actionsEl: HTMLElement;
  private footerEl: HTMLElement;
  private emptyStateEl: HTMLElement;
  private scoreDisplay: ScoreDisplay;
  private loadingState: LoadingState;
  private diffView: DiffView;
  private toneSelector: ToneSelector;
  private rewriteResult: HTMLElement;

  private activeField: HTMLElement | null = null;
  private repositionRAF: number | null = null;
  private onLoadingChange: (loading: boolean) => void;
  private onScoreReady: (field: HTMLElement, score: number, color: string) => void;

  constructor(
    shadowRoot: ShadowRoot,
    onLoadingChange: (loading: boolean) => void,
    onScoreReady: (field: HTMLElement, score: number, color: string) => void
  ) {
    this.onLoadingChange = onLoadingChange;
    this.onScoreReady = onScoreReady;

    this.el = document.createElement("div");
    this.el.className = "wg-popup-card";

    // Header
    this.headerEl = document.createElement("div");
    this.headerEl.className = "wg-popup-header";
    this.headerEl.innerHTML = `
      <div class="wg-popup-heading">
        <span class="wg-popup-kicker">On-device writing assist</span>
        <span class="wg-popup-title">WriteGooderer</span>
      </div>
      <button class="wg-close-btn" aria-label="Close WriteGooderer">&times;</button>
    `;
    this.headerEl.querySelector(".wg-close-btn")!.addEventListener("click", () => this.hide());

    // Body (results area)
    this.bodyEl = document.createElement("div");
    this.bodyEl.className = "wg-popup-body";

    // Empty state
    this.emptyStateEl = document.createElement("div");
    this.emptyStateEl.className = "wg-empty-state";
    this.emptyStateEl.innerHTML = `
      <div class="wg-empty-eyebrow">Ready on this field</div>
      <div class="wg-empty-title">Proofread for mistakes or rewrite in a new tone.</div>
      <p class="wg-empty-copy">
        Grammar, spelling, punctuation, and punchier rewrites without sending your text to a cloud API.
      </p>
      <div class="wg-pill-row">
        <span class="wg-pill">Grammar + clarity</span>
        <span class="wg-pill">Tone presets</span>
        <span class="wg-pill">Local only</span>
      </div>
    `;

    // Score display
    this.scoreDisplay = new ScoreDisplay();

    // Loading state
    this.loadingState = new LoadingState();
    this.loadingState.hide();

    // Diff view
    this.diffView = new DiffView((text) => this.applyText(text));
    this.diffView.hide();

    // Tone selector
    this.toneSelector = new ToneSelector((tone) => this.handleToneSelect(tone));
    this.toneSelector.hide();

    // Rewrite result
    this.rewriteResult = document.createElement("div");
    this.rewriteResult.className = "wg-rewrite-result";
    this.rewriteResult.style.display = "none";

    this.bodyEl.appendChild(this.emptyStateEl);
    this.bodyEl.appendChild(this.scoreDisplay.element);
    this.bodyEl.appendChild(this.loadingState.element);
    this.bodyEl.appendChild(this.diffView.element);
    this.bodyEl.appendChild(this.toneSelector.element);
    this.bodyEl.appendChild(this.rewriteResult);

    // Action buttons
    this.actionsEl = document.createElement("div");
    this.actionsEl.className = "wg-popup-actions";

    const proofreadBtn = document.createElement("button");
    proofreadBtn.className = "wg-btn wg-btn-primary";
    proofreadBtn.textContent = "Proofread";
    proofreadBtn.addEventListener("click", () => this.handleProofread());

    const toneBtn = document.createElement("button");
    toneBtn.className = "wg-btn wg-btn-secondary";
    toneBtn.textContent = "Change Tone";
    toneBtn.addEventListener("click", () => this.toggleToneSelector());

    this.actionsEl.appendChild(proofreadBtn);
    this.actionsEl.appendChild(toneBtn);

    // Footer
    this.footerEl = document.createElement("div");
    this.footerEl.className = "wg-popup-footer";
    this.footerEl.textContent = "Chrome Prompt API · local only";

    this.el.appendChild(this.headerEl);
    this.el.appendChild(this.bodyEl);
    this.el.appendChild(this.actionsEl);
    this.el.appendChild(this.footerEl);

    shadowRoot.appendChild(this.el);
  }

  show(field: HTMLElement): void {
    this.resetContent();
    this.el.classList.add("wg-visible");
    this.attachToField(field);
    this.startTracking();
  }

  attachToField(field: HTMLElement): void {
    const changedField = this.activeField !== field;
    this.activeField = field;

    if (changedField) {
      this.resetContent();
    }

    this.position();
  }

  hide(): void {
    this.el.classList.remove("wg-visible");
    this.stopTracking();
    this.resetContent();
  }

  get isVisible(): boolean {
    return this.el.classList.contains("wg-visible");
  }

  private position(): void {
    if (!this.activeField) return;
    if (!this.activeField.isConnected) {
      this.hide();
      return;
    }

    const rect = this.activeField.getBoundingClientRect();
    const desiredTop = rect.bottom + window.scrollY + POPUP_GAP;
    const availableBelow = Math.max(0, window.innerHeight - rect.bottom - VIEWPORT_PADDING);

    const chromeHeight =
      this.headerEl.offsetHeight +
      this.actionsEl.offsetHeight +
      this.footerEl.offsetHeight +
      2;
    const popupMaxHeight = Math.max(
      chromeHeight + MIN_BODY_HEIGHT,
      Math.min(POPUP_MAX_HEIGHT, availableBelow)
    );

    this.el.style.top = `${desiredTop}px`;
    this.el.style.maxHeight = `${popupMaxHeight}px`;
    this.bodyEl.style.maxHeight = `${Math.max(MIN_BODY_HEIGHT, popupMaxHeight - chromeHeight)}px`;

    const minLeft = window.scrollX + VIEWPORT_PADDING;
    const maxLeft = window.scrollX + window.innerWidth - POPUP_WIDTH - VIEWPORT_PADDING;
    const desiredLeft = rect.right + window.scrollX - POPUP_WIDTH;
    const clampedLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

    this.el.style.left = `${clampedLeft}px`;
  }

  private startTracking(): void {
    this.stopTracking();

    const track = () => {
      if (!this.isVisible) return;
      this.position();
      this.repositionRAF = requestAnimationFrame(track);
    };

    this.repositionRAF = requestAnimationFrame(track);
  }

  private stopTracking(): void {
    if (this.repositionRAF !== null) {
      cancelAnimationFrame(this.repositionRAF);
      this.repositionRAF = null;
    }
  }

  private resetContent(): void {
    this.emptyStateEl.style.display = "block";
    this.loadingState.hide();
    this.scoreDisplay.element.style.display = "none";
    this.diffView.hide();
    this.toneSelector.hide();
    this.rewriteResult.style.display = "none";
  }

  private getFieldText(field: HTMLElement | null = this.activeField): string {
    if (!field) return "";

    // Check for selection first
    if (field instanceof HTMLTextAreaElement) {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      if (start !== end) {
        return field.value.substring(start, end);
      }
      return field.value;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return selection.toString();
    }

    return field.innerText || field.textContent || "";
  }

  private async handleProofread(): Promise<void> {
    const requestField = this.activeField;
    const text = this.getFieldText(requestField);
    if (!text.trim()) return;

    this.emptyStateEl.style.display = "none";
    this.showLoading(true);
    this.diffView.hide();
    this.toneSelector.hide();
    this.rewriteResult.style.display = "none";

    try {
      const result = await proofread(text);

      const tier = getTierForScore(result.score);
      if (requestField) {
        this.onScoreReady(requestField, result.score, tier.color);
      }

      if (!requestField || this.activeField !== requestField) {
        return;
      }

      this.scoreDisplay.element.style.display = "block";
      this.scoreDisplay.setScore(result.score);
      this.diffView.show(text, result.corrected, result.changes);
    } catch (err) {
      if (!requestField || this.activeField !== requestField) {
        return;
      }

      this.showError(
        err instanceof Error ? err.message : "Failed to connect to the AI. Try again."
      );
    } finally {
      this.showLoading(false);
    }
  }

  private async handleToneSelect(tone: TonePreset): Promise<void> {
    const requestField = this.activeField;
    const text = this.getFieldText(requestField);
    if (!text.trim()) return;

    this.emptyStateEl.style.display = "none";
    this.showLoading(true);
    this.diffView.hide();
    this.rewriteResult.style.display = "none";

    try {
      const result = await rewrite(text, tone);

      if (!requestField || this.activeField !== requestField) {
        return;
      }

      this.toneSelector.hide();
      this.showRewriteResult(result.rewritten);
    } catch (err) {
      if (!requestField || this.activeField !== requestField) {
        return;
      }

      this.showError(
        err instanceof Error ? err.message : "Failed to connect to the AI. Try again."
      );
    } finally {
      this.showLoading(false);
    }
  }

  private showRewriteResult(text: string): void {
    this.rewriteResult.innerHTML = "";
    this.emptyStateEl.style.display = "none";
    this.rewriteResult.style.display = "block";

    const pre = document.createElement("div");
    pre.className = "wg-rewrite-text";
    pre.textContent = text;

    const applyBtn = document.createElement("button");
    applyBtn.className = "wg-btn wg-btn-primary";
    applyBtn.textContent = "Apply";
    applyBtn.addEventListener("click", () => this.applyText(text));

    const copyBtn = document.createElement("button");
    copyBtn.className = "wg-btn wg-btn-secondary";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    });

    const actions = document.createElement("div");
    actions.className = "wg-diff-actions";
    actions.appendChild(applyBtn);
    actions.appendChild(copyBtn);

    this.rewriteResult.appendChild(pre);
    this.rewriteResult.appendChild(actions);
  }

  private toggleToneSelector(): void {
    if (this.toneSelector.element.style.display === "block") {
      this.resetContent();
    } else {
      this.emptyStateEl.style.display = "none";
      this.diffView.hide();
      this.rewriteResult.style.display = "none";
      this.toneSelector.show();
    }
  }

  private applyText(text: string): void {
    if (!this.activeField) return;

    if (
      this.activeField instanceof HTMLTextAreaElement ||
      this.activeField instanceof HTMLInputElement
    ) {
      this.activeField.value = text;
      this.activeField.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      // contenteditable
      this.activeField.focus();
      document.execCommand("selectAll", false);
      document.execCommand("insertText", false, text);
    }

    this.hide();
  }

  private showLoading(loading: boolean): void {
    this.onLoadingChange(loading);
    if (loading) {
      this.loadingState.show();
    } else {
      this.loadingState.hide();
    }
  }

  private showError(message: string): void {
    this.rewriteResult.innerHTML = "";
    this.emptyStateEl.style.display = "none";
    this.rewriteResult.style.display = "block";
    const errEl = document.createElement("div");
    errEl.className = "wg-error";
    errEl.textContent = message;
    this.rewriteResult.appendChild(errEl);
  }
}
