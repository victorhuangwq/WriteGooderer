import { getTierForScore, PERFECT_SCORE_THRESHOLD } from "../shared/constants";
import type { ScoreTierConfig } from "../shared/constants";
import { burstConfetti } from "./confetti";

export class ScoreDisplay {
  private el: HTMLElement;
  private gaugeWrap: HTMLElement;
  private gaugeCircle: SVGCircleElement;
  private scoreText: HTMLElement;
  private tierEmoji: HTMLElement;
  private tierLabel: HTMLElement;
  private metaLabel: HTMLElement;
  private currentScore = 0;
  private changeCount = 0;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "wg-score-display";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("class", "wg-gauge");

    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", "60");
    bgCircle.setAttribute("cy", "60");
    bgCircle.setAttribute("r", "50");
    bgCircle.setAttribute("class", "wg-gauge-bg");

    this.gaugeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.gaugeCircle.setAttribute("cx", "60");
    this.gaugeCircle.setAttribute("cy", "60");
    this.gaugeCircle.setAttribute("r", "50");
    this.gaugeCircle.setAttribute("class", "wg-gauge-fill");

    svg.appendChild(bgCircle);
    svg.appendChild(this.gaugeCircle);

    this.tierEmoji = document.createElement("span");
    this.tierEmoji.className = "wg-tier-emoji";

    this.scoreText = document.createElement("span");
    this.scoreText.className = "wg-score-number";

    const gaugeInner = document.createElement("div");
    gaugeInner.className = "wg-gauge-inner";
    gaugeInner.appendChild(this.tierEmoji);
    gaugeInner.appendChild(this.scoreText);

    this.gaugeWrap = document.createElement("div");
    this.gaugeWrap.className = "wg-gauge-wrap";
    this.gaugeWrap.appendChild(svg);
    this.gaugeWrap.appendChild(gaugeInner);

    this.tierLabel = document.createElement("div");
    this.tierLabel.className = "wg-tier-label";

    this.metaLabel = document.createElement("div");
    this.metaLabel.className = "wg-score-meta";

    const info = document.createElement("div");
    info.className = "wg-score-info";
    info.appendChild(this.tierLabel);
    info.appendChild(this.metaLabel);

    this.el.appendChild(this.gaugeWrap);
    this.el.appendChild(info);
  }

  get element(): HTMLElement {
    return this.el;
  }

  setScore(score: number): void {
    const tier = getTierForScore(score);
    this.el.style.setProperty("--wg-tier-color", tier.color);
    this.animateScore(score, tier);
  }

  setChangeCount(n: number): void {
    this.changeCount = n;
    this.updateMeta();
  }

  private updateMeta(): void {
    if (this.changeCount === 0) {
      this.metaLabel.textContent = "no changes needed";
    } else if (this.changeCount === 1) {
      this.metaLabel.textContent = "1 suggestion";
    } else {
      this.metaLabel.textContent = `${this.changeCount} suggestions`;
    }
  }

  private animateScore(target: number, tier: ScoreTierConfig): void {
    const circumference = 2 * Math.PI * 50;
    const start = this.currentScore;
    const duration = 600;
    const startTime = performance.now();

    this.tierEmoji.textContent = tier.emoji;
    this.gaugeWrap.classList.remove("wg-bump");
    void this.gaugeWrap.offsetWidth;
    this.gaugeWrap.classList.add("wg-bump");

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      this.scoreText.textContent = String(current);
      const offset = circumference - (current / 100) * circumference;
      this.gaugeCircle.style.strokeDasharray = `${circumference}`;
      this.gaugeCircle.style.strokeDashoffset = `${offset}`;
      this.gaugeCircle.style.stroke = tier.color;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentScore = target;
        this.tierLabel.textContent = tier.name;
        this.tierLabel.style.color = tier.color;
        this.el.classList.toggle("is-perfect", target >= PERFECT_SCORE_THRESHOLD);
        if (target >= PERFECT_SCORE_THRESHOLD) {
          burstConfetti(this.gaugeWrap);
        }
      }
    };

    requestAnimationFrame(animate);
  }
}
