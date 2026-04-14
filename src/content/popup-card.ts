import { sendMessage } from "../shared/messages";
import { getTierForScore } from "../shared/constants";
import type {
  ErrorResponse,
  ProofreadResponse,
  RewriteToneResponse,
} from "../shared/messages";
import type { TonePreset } from "../shared/types";
import { ScoreDisplay } from "./score-display";
import { LoadingState } from "./loading-state";
import { DiffView } from "./diff-view";
import { ToneSelector } from "./tone-selector";

export class PopupCard {
  private el: HTMLElement;
  private headerEl: HTMLElement;
  private bodyEl: HTMLElement;
  private actionsEl: HTMLElement;
  private footerEl: HTMLElement;
  private scoreDisplay: ScoreDisplay;
  private loadingState: LoadingState;
  private diffView: DiffView;
  private toneSelector: ToneSelector;
  private rewriteResult: HTMLElement;

  private activeField: HTMLElement | null = null;
  private onLoadingChange: (loading: boolean) => void;
  private onScoreReady: (score: number, color: string) => void;

  constructor(
    shadowRoot: ShadowRoot,
    onLoadingChange: (loading: boolean) => void,
    onScoreReady: (score: number, color: string) => void
  ) {
    this.onLoadingChange = onLoadingChange;
    this.onScoreReady = onScoreReady;

    this.el = document.createElement("div");
    this.el.className = "wg-popup-card";

    // Header
    this.headerEl = document.createElement("div");
    this.headerEl.className = "wg-popup-header";
    this.headerEl.innerHTML = `
      <span class="wg-popup-title">WriteGooderer</span>
      <button class="wg-close-btn">&times;</button>
    `;
    this.headerEl.querySelector(".wg-close-btn")!.addEventListener("click", () => this.hide());

    // Body (results area)
    this.bodyEl = document.createElement("div");
    this.bodyEl.className = "wg-popup-body";

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
    this.footerEl.textContent = "Powered by your own computer";

    this.el.appendChild(this.headerEl);
    this.el.appendChild(this.bodyEl);
    this.el.appendChild(this.actionsEl);
    this.el.appendChild(this.footerEl);

    shadowRoot.appendChild(this.el);
  }

  show(field: HTMLElement): void {
    this.activeField = field;
    this.el.classList.add("wg-visible");
    this.scoreDisplay.element.style.display = "none";
    this.diffView.hide();
    this.toneSelector.hide();
    this.rewriteResult.style.display = "none";
    this.position();
  }

  hide(): void {
    this.el.classList.remove("wg-visible");
    this.loadingState.hide();
    this.toneSelector.hide();
  }

  get isVisible(): boolean {
    return this.el.classList.contains("wg-visible");
  }

  private position(): void {
    if (!this.activeField) return;
    const rect = this.activeField.getBoundingClientRect();
    const cardHeight = 400;
    const spaceBelow = window.innerHeight - rect.bottom;
    const showBelow = spaceBelow > cardHeight || spaceBelow > rect.top;

    if (showBelow) {
      this.el.style.top = `${rect.bottom + window.scrollY + 8}px`;
    } else {
      this.el.style.top = `${rect.top + window.scrollY - cardHeight - 8}px`;
    }

    this.el.style.left = `${Math.max(8, rect.right + window.scrollX - 360)}px`;
  }

  private getFieldText(): string {
    if (!this.activeField) return "";

    // Check for selection first
    if (this.activeField instanceof HTMLTextAreaElement) {
      const start = this.activeField.selectionStart;
      const end = this.activeField.selectionEnd;
      if (start !== end) {
        return this.activeField.value.substring(start, end);
      }
      return this.activeField.value;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return selection.toString();
    }

    return this.activeField.innerText || this.activeField.textContent || "";
  }

  private async handleProofread(): Promise<void> {
    const text = this.getFieldText();
    if (!text.trim()) return;

    this.showLoading(true);
    this.diffView.hide();
    this.toneSelector.hide();
    this.rewriteResult.style.display = "none";

    try {
      const response = await sendMessage<ProofreadResponse | ErrorResponse>({
        type: "PROOFREAD",
        text,
      });

      if ("success" in response && response.success) {
        const { result } = response as ProofreadResponse;
        this.scoreDisplay.element.style.display = "block";
        this.scoreDisplay.setScore(result.score);

        const tier = getTierForScore(result.score);
        this.onScoreReady(result.score, tier.color);

        this.diffView.show(text, result.corrected, result.changes);
      } else {
        this.showError((response as ErrorResponse).error);
      }
    } catch (err) {
      this.showError("Failed to connect to the AI. Try again.");
    } finally {
      this.showLoading(false);
    }
  }

  private async handleToneSelect(tone: TonePreset): Promise<void> {
    const text = this.getFieldText();
    if (!text.trim()) return;

    this.showLoading(true);
    this.diffView.hide();
    this.rewriteResult.style.display = "none";

    try {
      const response = await sendMessage<RewriteToneResponse | ErrorResponse>({
        type: "REWRITE_TONE",
        text,
        tone,
      });

      if ("success" in response && response.success) {
        const { result } = response as RewriteToneResponse;
        this.toneSelector.hide();
        this.showRewriteResult(result.rewritten);
      } else {
        this.showError((response as ErrorResponse).error);
      }
    } catch (err) {
      this.showError("Failed to connect to the AI. Try again.");
    } finally {
      this.showLoading(false);
    }
  }

  private showRewriteResult(text: string): void {
    this.rewriteResult.innerHTML = "";
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
      this.toneSelector.hide();
    } else {
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
    this.rewriteResult.style.display = "block";
    const errEl = document.createElement("div");
    errEl.className = "wg-error";
    errEl.textContent = message;
    this.rewriteResult.appendChild(errEl);
  }
}
