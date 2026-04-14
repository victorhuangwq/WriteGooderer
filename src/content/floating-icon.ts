export class FloatingIcon {
  private el: HTMLElement;
  private scoreEl: HTMLElement;
  private currentField: HTMLElement | null = null;
  private repositionRAF: number | null = null;
  private onClick: () => void;

  constructor(shadowRoot: ShadowRoot, onClick: () => void) {
    this.onClick = onClick;

    this.el = document.createElement("div");
    this.el.className = "wg-floating-icon";
    this.el.innerHTML = "W";
    this.el.addEventListener("mousedown", (e) => {
      e.preventDefault(); // prevent focusout on the field
      e.stopPropagation();
    });
    this.el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick();
    });

    this.scoreEl = document.createElement("span");
    this.scoreEl.className = "wg-floating-score";
    this.scoreEl.style.display = "none";
    this.el.appendChild(this.scoreEl);

    shadowRoot.appendChild(this.el);
  }

  show(field: HTMLElement): void {
    this.currentField = field;
    this.el.classList.add("wg-visible");
    this.position();
    this.startTracking();
  }

  hide(): void {
    this.currentField = null;
    this.el.classList.remove("wg-visible");
    this.stopTracking();
  }

  setLoading(loading: boolean): void {
    this.el.classList.toggle("wg-loading", loading);
  }

  showScore(score: number, color: string): void {
    this.scoreEl.textContent = String(score);
    this.scoreEl.style.backgroundColor = color;
    this.scoreEl.style.display = "flex";
  }

  hideScore(): void {
    this.scoreEl.style.display = "none";
  }

  private position(): void {
    if (!this.currentField) return;
    const rect = this.currentField.getBoundingClientRect();
    this.el.style.top = `${rect.bottom + window.scrollY - 40}px`;
    this.el.style.left = `${rect.right + window.scrollX - 40}px`;
  }

  private startTracking(): void {
    this.stopTracking();
    const track = () => {
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
}
