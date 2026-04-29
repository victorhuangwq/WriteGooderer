import { LOADING_QUIPS } from "../shared/constants";
import { subscribeDownloadProgress } from "./ai-client";

export class LoadingState {
  private el: HTMLElement;
  private fillEl: HTMLElement;
  private quipEl: HTMLElement;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private unsubscribeProgress: (() => void) | null = null;
  private downloadActive = false;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "wg-loading-state";

    const bar = document.createElement("div");
    bar.className = "wg-progress-bar";
    this.fillEl = document.createElement("div");
    this.fillEl.className = "wg-progress-fill";
    bar.appendChild(this.fillEl);

    this.quipEl = document.createElement("p");
    this.quipEl.className = "wg-quip";

    this.el.appendChild(bar);
    this.el.appendChild(this.quipEl);
  }

  get element(): HTMLElement {
    return this.el;
  }

  show(): void {
    this.el.style.display = "block";
    this.rotateQuip();
    this.intervalId = setInterval(() => this.rotateQuip(), 2500);
    this.unsubscribeProgress = subscribeDownloadProgress((p) => this.onProgress(p));
  }

  hide(): void {
    this.el.style.display = "none";
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.unsubscribeProgress?.();
    this.unsubscribeProgress = null;
    this.downloadActive = false;
    this.fillEl.style.width = "";
    this.fillEl.style.animation = "";
  }

  private onProgress(p: number | null): void {
    if (p === null) {
      // Download complete (or never started). Resume the indeterminate animation
      // and the quip rotation.
      if (this.downloadActive) {
        this.downloadActive = false;
        this.fillEl.style.width = "";
        this.fillEl.style.animation = "";
        if (!this.intervalId) {
          this.intervalId = setInterval(() => this.rotateQuip(), 2500);
        }
        this.rotateQuip();
      }
      return;
    }
    // Download in progress — pin the bar to a real percentage and replace the
    // quip with a download status line.
    this.downloadActive = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const pct = Math.max(0, Math.min(1, p));
    this.fillEl.style.animation = "none";
    this.fillEl.style.width = `${(pct * 100).toFixed(1)}%`;
    this.quipEl.classList.remove("wg-quip-fade");
    this.quipEl.textContent = `Downloading model… ${Math.round(pct * 100)}%`;
  }

  private rotateQuip(): void {
    if (this.downloadActive) return;
    const quip = LOADING_QUIPS[Math.floor(Math.random() * LOADING_QUIPS.length)];
    this.quipEl.classList.remove("wg-quip-fade");
    // Force reflow for animation restart
    void this.quipEl.offsetWidth;
    this.quipEl.textContent = quip;
    this.quipEl.classList.add("wg-quip-fade");
  }
}
