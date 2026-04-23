import type { ProofreadChange } from "../shared/types";
import { burstConfetti } from "./confetti";

type Category = "spelling" | "grammar" | "style";

export class DiffView {
  private el: HTMLElement;
  private listEl: HTMLElement;
  private summaryEl: HTMLElement;
  private applyBtn: HTMLButtonElement;
  private actionsEl: HTMLElement;
  private onApply: (text: string) => void;
  private correctedText = "";

  constructor(onApply: (text: string) => void) {
    this.onApply = onApply;

    this.el = document.createElement("div");
    this.el.className = "wg-diff-view";

    this.summaryEl = document.createElement("div");
    this.summaryEl.className = "wg-diff-summary";

    this.listEl = document.createElement("div");
    this.listEl.className = "wg-diff-content";

    this.applyBtn = document.createElement("button");
    this.applyBtn.className = "wg-btn wg-btn-primary";
    this.applyBtn.textContent = "Apply Changes";
    this.applyBtn.addEventListener("click", () => this.apply());

    this.actionsEl = document.createElement("div");
    this.actionsEl.className = "wg-diff-actions";
    this.actionsEl.appendChild(this.applyBtn);

    this.el.appendChild(this.summaryEl);
    this.el.appendChild(this.listEl);
    this.el.appendChild(this.actionsEl);
  }

  get element(): HTMLElement {
    return this.el;
  }

  show(original: string, corrected: string, changes: ProofreadChange[]): void {
    this.correctedText = corrected;
    this.listEl.innerHTML = "";
    this.summaryEl.innerHTML = "";
    this.el.style.display = "block";
    this.actionsEl.style.display = "flex";

    if (changes.length === 0) {
      this.renderEmptyCelebration();
      this.actionsEl.style.display = "none";
      return;
    }

    const counts: Record<Category, number> = { spelling: 0, grammar: 0, style: 0 };
    for (const change of changes) {
      counts[this.inferCategory(change)]++;
    }
    this.renderSummary(counts);

    const fragment = document.createDocumentFragment();
    let remaining = original;

    for (const change of changes) {
      const idx = remaining.indexOf(change.original);
      if (idx === -1) continue;

      if (idx > 0) {
        fragment.appendChild(document.createTextNode(remaining.substring(0, idx)));
      }

      const del = document.createElement("span");
      del.className = "wg-diff-remove";
      del.textContent = change.original;
      if (change.reason) del.title = change.reason;
      fragment.appendChild(del);

      const ins = document.createElement("span");
      ins.className = "wg-diff-add";
      ins.textContent = change.replacement;
      if (change.reason) ins.title = change.reason;
      fragment.appendChild(ins);

      remaining = remaining.substring(idx + change.original.length);
    }

    if (remaining) {
      fragment.appendChild(document.createTextNode(remaining));
    }

    this.listEl.appendChild(fragment);
  }

  hide(): void {
    this.el.style.display = "none";
  }

  private renderSummary(counts: Record<Category, number>): void {
    this.summaryEl.innerHTML = "";
    const total = counts.spelling + counts.grammar + counts.style;
    const title = document.createElement("div");
    title.className = "wg-diff-summary-title";
    title.textContent = total === 1 ? "1 suggestion" : `${total} suggestions`;
    this.summaryEl.appendChild(title);

    const chips = document.createElement("div");
    chips.className = "wg-diff-summary-chips";
    const entries: [Category, string][] = [
      ["spelling", "spelling"],
      ["grammar", "grammar"],
      ["style", "style"],
    ];
    for (const [cat, label] of entries) {
      if (counts[cat] === 0) continue;
      const chip = document.createElement("span");
      chip.className = `wg-chip wg-chip-${cat}`;
      chip.textContent = `${counts[cat]} ${label}`;
      chips.appendChild(chip);
    }
    this.summaryEl.appendChild(chips);
  }

  private inferCategory(change: ProofreadChange): Category {
    const reason = (change.reason || "").toLowerCase();
    if (reason.includes("spell") || reason.includes("typo")) return "spelling";
    if (
      reason.includes("grammar") ||
      reason.includes("punctuation") ||
      reason.includes("capital") ||
      reason.includes("tense") ||
      reason.includes("agreement")
    ) {
      return "grammar";
    }
    if (reason.includes("style") || reason.includes("word choice") || reason.includes("clarity")) {
      return "style";
    }
    const orig = change.original || "";
    const repl = change.replacement || "";
    const isSingleToken = !/\s/.test(orig);
    if (isSingleToken && Math.abs(orig.length - repl.length) <= 2) {
      return "spelling";
    }
    if (/[.,!?;:]/.test(orig) !== /[.,!?;:]/.test(repl)) return "grammar";
    if (orig.toLowerCase() === repl.toLowerCase()) return "grammar";
    return "style";
  }

  private apply(): void {
    this.onApply(this.correctedText);
  }

  private renderEmptyCelebration(text?: string): void {
    const wrap = document.createElement("div");
    wrap.className = "wg-empty-celebrate";

    const emoji = document.createElement("div");
    emoji.className = "wg-empty-emoji";
    emoji.textContent = "🎉";

    const msg = document.createElement("p");
    msg.className = "wg-diff-perfect";
    msg.textContent = text || "Your writing is already gooderer! No changes needed.";

    wrap.appendChild(emoji);
    wrap.appendChild(msg);
    this.listEl.appendChild(wrap);

    requestAnimationFrame(() => burstConfetti(wrap));
  }
}
