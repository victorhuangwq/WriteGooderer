const COLORS = ["#FE6B8B", "#FF8E53", "#FFD93D", "#4ECDC4", "#2ECC71"];

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function burstConfetti(host: HTMLElement, count = 22): void {
  if (prefersReducedMotion()) return;

  const root = document.createElement("div");
  root.className = "wg-confetti-root";

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("i");
    piece.className = "wg-confetto";
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40;
    const rot = (Math.random() * 720 - 360).toFixed(0);
    const color = COLORS[i % COLORS.length];
    const delay = (Math.random() * 120).toFixed(0);
    piece.style.setProperty("--wg-tx", `${tx.toFixed(0)}px`);
    piece.style.setProperty("--wg-ty", `${ty.toFixed(0)}px`);
    piece.style.setProperty("--wg-r", `${rot}deg`);
    piece.style.setProperty("--wg-c", color);
    piece.style.animationDelay = `${delay}ms`;
    root.appendChild(piece);
  }

  host.appendChild(root);
  window.setTimeout(() => {
    root.remove();
  }, 1400);
}
