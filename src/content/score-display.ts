import { getTierForScore } from "../shared/constants";
import type { ScoreTierConfig } from "../shared/constants";

export class ScoreDisplay {
  private el: HTMLElement;
  private gaugeCircle: SVGCircleElement;
  private scoreText: HTMLElement;
  private tierLabel: HTMLElement;
  private currentScore = 0;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "wg-score-display";

    // SVG gauge
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("class", "wg-gauge");

    // Background circle
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", "60");
    bgCircle.setAttribute("cy", "60");
    bgCircle.setAttribute("r", "50");
    bgCircle.setAttribute("class", "wg-gauge-bg");

    // Score arc
    this.gaugeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.gaugeCircle.setAttribute("cx", "60");
    this.gaugeCircle.setAttribute("cy", "60");
    this.gaugeCircle.setAttribute("r", "50");
    this.gaugeCircle.setAttribute("class", "wg-gauge-fill");

    svg.appendChild(bgCircle);
    svg.appendChild(this.gaugeCircle);

    const gaugeWrap = document.createElement("div");
    gaugeWrap.className = "wg-gauge-wrap";
    gaugeWrap.appendChild(svg);

    // Score number (sibling of the gauge, inline)
    this.scoreText = document.createElement("span");
    this.scoreText.className = "wg-score-number";

    // Tier label
    this.tierLabel = document.createElement("div");
    this.tierLabel.className = "wg-tier-label";

    this.el.appendChild(gaugeWrap);
    this.el.appendChild(this.scoreText);
    this.el.appendChild(this.tierLabel);
  }

  get element(): HTMLElement {
    return this.el;
  }

  setScore(score: number): void {
    const tier = getTierForScore(score);
    this.animateScore(score, tier);
  }

  private animateScore(target: number, tier: ScoreTierConfig): void {
    const circumference = 2 * Math.PI * 50;
    const start = this.currentScore;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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
      }
    };

    requestAnimationFrame(animate);
  }
}
