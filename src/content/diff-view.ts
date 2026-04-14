import type { ProofreadChange } from "../shared/types";

export class DiffView {
  private el: HTMLElement;
  private diffContent: HTMLElement;
  private onApply: (text: string) => void;
  private correctedText = "";

  constructor(onApply: (text: string) => void) {
    this.onApply = onApply;

    this.el = document.createElement("div");
    this.el.className = "wg-diff-view";

    this.diffContent = document.createElement("div");
    this.diffContent.className = "wg-diff-content";

    const applyBtn = document.createElement("button");
    applyBtn.className = "wg-btn wg-btn-primary";
    applyBtn.textContent = "Accept All";
    applyBtn.addEventListener("click", () => {
      this.onApply(this.correctedText);
    });

    const btnWrap = document.createElement("div");
    btnWrap.className = "wg-diff-actions";
    btnWrap.appendChild(applyBtn);

    this.el.appendChild(this.diffContent);
    this.el.appendChild(btnWrap);
  }

  get element(): HTMLElement {
    return this.el;
  }

  show(original: string, corrected: string, changes: ProofreadChange[]): void {
    this.correctedText = corrected;
    this.diffContent.innerHTML = "";
    this.el.style.display = "block";

    if (changes.length === 0) {
      const p = document.createElement("p");
      p.className = "wg-diff-perfect";
      p.textContent = "Your writing is already gooderer! No changes needed.";
      this.diffContent.appendChild(p);
      return;
    }

    // Build word-level diff display
    const fragment = document.createDocumentFragment();
    let remaining = original;

    for (const change of changes) {
      const idx = remaining.indexOf(change.original);
      if (idx === -1) continue;

      // Text before the change
      if (idx > 0) {
        fragment.appendChild(document.createTextNode(remaining.substring(0, idx)));
      }

      // Removed text
      const del = document.createElement("span");
      del.className = "wg-diff-remove";
      del.textContent = change.original;
      del.title = change.reason;
      fragment.appendChild(del);

      // Added text
      const ins = document.createElement("span");
      ins.className = "wg-diff-add";
      ins.textContent = change.replacement;
      ins.title = change.reason;
      fragment.appendChild(ins);

      remaining = remaining.substring(idx + change.original.length);
    }

    // Remaining text after last change
    if (remaining) {
      fragment.appendChild(document.createTextNode(remaining));
    }

    this.diffContent.appendChild(fragment);
  }

  hide(): void {
    this.el.style.display = "none";
  }
}
