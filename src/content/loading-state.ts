import { LOADING_QUIPS } from "../shared/constants";

export class LoadingState {
  private el: HTMLElement;
  private quipEl: HTMLElement;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "wg-loading-state";

    const bar = document.createElement("div");
    bar.className = "wg-progress-bar";
    const fill = document.createElement("div");
    fill.className = "wg-progress-fill";
    bar.appendChild(fill);

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
  }

  hide(): void {
    this.el.style.display = "none";
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private rotateQuip(): void {
    const quip = LOADING_QUIPS[Math.floor(Math.random() * LOADING_QUIPS.length)];
    this.quipEl.classList.remove("wg-quip-fade");
    // Force reflow for animation restart
    void this.quipEl.offsetWidth;
    this.quipEl.textContent = quip;
    this.quipEl.classList.add("wg-quip-fade");
  }
}
