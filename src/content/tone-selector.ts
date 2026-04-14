import { TONES } from "../shared/constants";
import { getPreferences, setLastTone } from "../shared/storage";
import type { TonePreset } from "../shared/types";

export class ToneSelector {
  private el: HTMLElement;
  private selected: TonePreset = "professional";
  private onSelect: (tone: TonePreset) => void;
  private buttons: Map<TonePreset, HTMLElement> = new Map();

  constructor(onSelect: (tone: TonePreset) => void) {
    this.onSelect = onSelect;

    this.el = document.createElement("div");
    this.el.className = "wg-tone-selector";

    const grid = document.createElement("div");
    grid.className = "wg-tone-grid";

    for (const [key, config] of Object.entries(TONES)) {
      const tone = key as TonePreset;
      const btn = document.createElement("button");
      btn.className = "wg-tone-btn";
      btn.innerHTML = `<span class="wg-tone-name">${config.name}</span><span class="wg-tone-sub">${config.subtitle}</span>`;
      btn.addEventListener("click", () => this.selectTone(tone));
      grid.appendChild(btn);
      this.buttons.set(tone, btn);
    }

    this.el.appendChild(grid);

    // Load last tone preference
    getPreferences().then((prefs) => {
      this.selected = prefs.lastTone;
      this.updateSelection();
    });
  }

  get element(): HTMLElement {
    return this.el;
  }

  show(): void {
    this.el.style.display = "block";
  }

  hide(): void {
    this.el.style.display = "none";
  }

  private selectTone(tone: TonePreset): void {
    this.selected = tone;
    this.updateSelection();
    setLastTone(tone);
    this.onSelect(tone);
  }

  private updateSelection(): void {
    for (const [tone, btn] of this.buttons) {
      btn.classList.toggle("wg-tone-selected", tone === this.selected);
    }
  }
}
