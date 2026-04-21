import type { ProofreadChange } from "../shared/types";
import { burstConfetti } from "./confetti";

type Category = "spelling" | "grammar" | "style";

interface ChangeState {
  change: ProofreadChange;
  category: Category;
  status: "pending" | "accepted" | "ignored";
  el: HTMLElement;
}

export class DiffView {
  private el: HTMLElement;
  private listEl: HTMLElement;
  private summaryEl: HTMLElement;
  private acceptAllBtn: HTMLButtonElement;
  private ignoreAllBtn: HTMLButtonElement;
  private actionsEl: HTMLElement;
  private onApply: (text: string) => void;
  private original = "";
  private items: ChangeState[] = [];

  constructor(onApply: (text: string) => void) {
    this.onApply = onApply;

    this.el = document.createElement("div");
    this.el.className = "wg-diff-view";

    this.summaryEl = document.createElement("div");
    this.summaryEl.className = "wg-diff-summary";

    this.listEl = document.createElement("div");
    this.listEl.className = "wg-diff-content";

    this.acceptAllBtn = document.createElement("button");
    this.acceptAllBtn.className = "wg-btn wg-btn-primary";
    this.acceptAllBtn.textContent = "Accept All";
    this.acceptAllBtn.addEventListener("click", () => this.acceptAll());

    this.ignoreAllBtn = document.createElement("button");
    this.ignoreAllBtn.className = "wg-btn wg-btn-secondary";
    this.ignoreAllBtn.textContent = "Ignore All";
    this.ignoreAllBtn.addEventListener("click", () => this.ignoreAll());

    this.actionsEl = document.createElement("div");
    this.actionsEl.className = "wg-diff-actions";
    this.actionsEl.appendChild(this.acceptAllBtn);
    this.actionsEl.appendChild(this.ignoreAllBtn);

    this.el.appendChild(this.summaryEl);
    this.el.appendChild(this.listEl);
    this.el.appendChild(this.actionsEl);
  }

  get element(): HTMLElement {
    return this.el;
  }

  show(original: string, _corrected: string, changes: ProofreadChange[]): void {
    this.original = original;
    this.listEl.innerHTML = "";
    this.summaryEl.innerHTML = "";
    this.items = [];
    this.el.style.display = "block";
    this.actionsEl.style.display = "flex";

    if (changes.length === 0) {
      this.renderEmptyCelebration();
      this.actionsEl.style.display = "none";
      return;
    }

    const counts: Record<Category, number> = { spelling: 0, grammar: 0, style: 0 };
    for (const change of changes) {
      const category = this.inferCategory(change);
      counts[category]++;
      const card = this.buildCard(change, category);
      this.items.push({ change, category, status: "pending", el: card });
      this.listEl.appendChild(card);
    }

    this.renderSummary(counts);
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

  private buildCard(change: ProofreadChange, category: Category): HTMLElement {
    const card = document.createElement("div");
    card.className = "wg-suggestion";

    const head = document.createElement("div");
    head.className = "wg-suggestion-head";

    const chip = document.createElement("span");
    chip.className = `wg-chip wg-chip-${category}`;
    chip.textContent = this.categoryLabel(category);
    head.appendChild(chip);

    const actions = document.createElement("div");
    actions.className = "wg-suggestion-actions";

    const acceptBtn = document.createElement("button");
    acceptBtn.className = "wg-btn-mini wg-btn-accept";
    acceptBtn.setAttribute("aria-label", "Accept suggestion");
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", () => this.acceptOne(card));

    const ignoreBtn = document.createElement("button");
    ignoreBtn.className = "wg-btn-mini wg-btn-ignore";
    ignoreBtn.setAttribute("aria-label", "Ignore suggestion");
    ignoreBtn.textContent = "Ignore";
    ignoreBtn.addEventListener("click", () => this.ignoreOne(card));

    actions.appendChild(acceptBtn);
    actions.appendChild(ignoreBtn);
    head.appendChild(actions);

    const diff = document.createElement("div");
    diff.className = "wg-suggestion-diff";

    const remove = document.createElement("span");
    remove.className = "wg-diff-remove";
    remove.textContent = change.original;

    const arrow = document.createElement("span");
    arrow.className = "wg-diff-arrow";
    arrow.textContent = "→";

    const add = document.createElement("span");
    add.className = "wg-diff-add";
    add.textContent = change.replacement;

    diff.appendChild(remove);
    diff.appendChild(arrow);
    diff.appendChild(add);

    const reason = document.createElement("div");
    reason.className = "wg-suggestion-reason";
    reason.textContent = change.reason;

    card.appendChild(head);
    card.appendChild(diff);
    if (change.reason) card.appendChild(reason);

    return card;
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

  private categoryLabel(category: Category): string {
    switch (category) {
      case "spelling":
        return "Spelling";
      case "grammar":
        return "Grammar";
      case "style":
        return "Style";
    }
  }

  private acceptOne(cardEl: HTMLElement): void {
    const item = this.items.find((i) => i.el === cardEl);
    if (!item || item.status !== "pending") return;
    item.status = "accepted";
    cardEl.classList.add("is-leaving");
    window.setTimeout(() => {
      cardEl.style.display = "none";
      this.maybeFinish();
    }, 220);
  }

  private ignoreOne(cardEl: HTMLElement): void {
    const item = this.items.find((i) => i.el === cardEl);
    if (!item || item.status !== "pending") return;
    item.status = "ignored";
    cardEl.classList.add("is-ignored");
    this.maybeFinish();
  }

  private acceptAll(): void {
    for (const item of this.items) {
      if (item.status === "pending") item.status = "accepted";
    }
    this.onApply(this.buildResultText());
  }

  private ignoreAll(): void {
    for (const item of this.items) {
      if (item.status === "pending") {
        item.status = "ignored";
        item.el.classList.add("is-ignored");
      }
    }
    this.maybeFinish();
  }

  private maybeFinish(): void {
    const pending = this.items.filter((i) => i.status === "pending");
    if (pending.length > 0) return;

    const anyAccepted = this.items.some((i) => i.status === "accepted");
    if (anyAccepted) {
      this.onApply(this.buildResultText());
    } else {
      this.listEl.innerHTML = "";
      this.renderEmptyCelebration("All suggestions ignored. You do you.");
      this.summaryEl.innerHTML = "";
      this.actionsEl.style.display = "none";
    }
  }

  private buildResultText(): string {
    let result = this.original;
    for (const item of this.items) {
      if (item.status !== "accepted") continue;
      const idx = result.indexOf(item.change.original);
      if (idx === -1) continue;
      result =
        result.substring(0, idx) +
        item.change.replacement +
        result.substring(idx + item.change.original.length);
    }
    return result;
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
