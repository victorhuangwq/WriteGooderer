export type ThemeMode = "light" | "dark";

export const FONT_DISPLAY = `"Fraunces", Georgia, "Iowan Old Style", serif`;
export const FONT_BODY = `"Inter", "Segoe UI", system-ui, -apple-system, sans-serif`;

export interface ThemeTokens {
  gradient: string;
  bgSoft: string;
  bgMuted: string;
  cardBg: string;
  popupBg: string;
  popupHeaderBg: string;
  sectionBg: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accentStrong: string;
  accentSoft: string;
  link: string;
  border: string;
  borderSoft: string;
  shadow: string;
  shadowSoft: string;
  pillBg: string;
  buttonSecondaryBg: string;
  buttonSecondaryHoverBg: string;
  toggleTrack: string;
  focusRing: string;
  glassHighlight: string;
  surfaceRaised: string;
  gaugeTrack: string;
  diffRemoveBg: string;
  diffRemoveFg: string;
  diffAddBg: string;
  diffAddFg: string;
  errorBg: string;
  errorBorder: string;
  errorFg: string;
  toneSelectedBg: string;
  toneSelectedBorder: string;
  toneHoverBg: string;
  iconShadow: string;
}

export const LIGHT_TOKENS: ThemeTokens = {
  gradient: "linear-gradient(135deg, #ff7a3e 0%, #ffab5c 100%)",
  bgSoft: "linear-gradient(145deg, #ffe9d6 0%, #fffaf4 100%)",
  bgMuted: "#fffaf6",
  cardBg: "rgba(255, 252, 248, 0.97)",
  popupBg:
    "radial-gradient(circle at top right, rgba(255, 196, 145, 0.38), transparent 42%), linear-gradient(180deg, #fffaf6 0%, #fff4ea 100%)",
  popupHeaderBg:
    "radial-gradient(circle at top right, rgba(255, 255, 255, 0.85), transparent 32%), linear-gradient(135deg, #ffede0 0%, #fff7f1 100%)",
  sectionBg: "rgba(255, 255, 255, 0.82)",
  text: "#2a1a11",
  textSecondary: "#5c3f2e",
  textTertiary: "#7a5a46",
  accentStrong: "#8a4a1f",
  accentSoft: "#73431a",
  link: "#7a3d10",
  border: "rgba(170, 118, 82, 0.28)",
  borderSoft: "rgba(190, 141, 109, 0.22)",
  shadow: "0 24px 54px rgba(110, 70, 43, 0.18)",
  shadowSoft: "0 12px 26px rgba(133, 86, 45, 0.08)",
  pillBg: "rgba(255, 255, 255, 0.82)",
  buttonSecondaryBg: "rgba(255, 255, 255, 0.86)",
  buttonSecondaryHoverBg: "rgba(255, 244, 235, 0.96)",
  toggleTrack: "#d5c1b0",
  focusRing: "rgba(138, 74, 31, 0.38)",
  glassHighlight: "rgba(255, 255, 255, 0.9)",
  surfaceRaised:
    "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,247,241,0.92) 100%)",
  gaugeTrack: "#f3e7dc",
  diffRemoveBg: "#ffe0e0",
  diffRemoveFg: "#b02020",
  diffAddBg: "#dcf7dc",
  diffAddFg: "#1f6f1f",
  errorBg: "linear-gradient(180deg, #fff5f3 0%, #fff0ed 100%)",
  errorBorder: "#ffd8d2",
  errorFg: "#b02222",
  toneSelectedBg: "linear-gradient(135deg, #fff0e3 0%, #fff9f2 100%)",
  toneSelectedBorder: "#ff9c66",
  toneHoverBg: "rgba(255, 241, 230, 0.98)",
  iconShadow: "0 14px 24px rgba(163, 97, 38, 0.28)",
};

export const DARK_TOKENS: ThemeTokens = {
  gradient: "linear-gradient(135deg, #ff9259 0%, #ffb97a 100%)",
  bgSoft: "linear-gradient(145deg, #2e2016 0%, #221611 100%)",
  bgMuted: "#1f1510",
  cardBg: "rgba(28, 20, 16, 0.96)",
  popupBg:
    "radial-gradient(circle at top right, rgba(255, 154, 92, 0.22), transparent 42%), linear-gradient(180deg, #1c140f 0%, #241a13 100%)",
  popupHeaderBg:
    "radial-gradient(circle at top right, rgba(255, 180, 130, 0.2), transparent 34%), linear-gradient(135deg, #2d1e15 0%, #241812 100%)",
  sectionBg: "rgba(50, 34, 24, 0.72)",
  text: "#f5e8dc",
  textSecondary: "#d9bfa7",
  textTertiary: "#a88a72",
  accentStrong: "#ffb386",
  accentSoft: "#f0a060",
  link: "#ffb98a",
  border: "rgba(255, 180, 130, 0.22)",
  borderSoft: "rgba(255, 180, 130, 0.14)",
  shadow: "0 24px 54px rgba(0, 0, 0, 0.55)",
  shadowSoft: "0 12px 26px rgba(0, 0, 0, 0.32)",
  pillBg: "rgba(70, 48, 34, 0.7)",
  buttonSecondaryBg: "rgba(70, 48, 34, 0.6)",
  buttonSecondaryHoverBg: "rgba(90, 62, 44, 0.75)",
  toggleTrack: "#4a3526",
  focusRing: "rgba(255, 179, 134, 0.55)",
  glassHighlight: "rgba(255, 255, 255, 0.08)",
  surfaceRaised:
    "linear-gradient(180deg, rgba(58, 40, 28, 0.72) 0%, rgba(44, 30, 22, 0.78) 100%)",
  gaugeTrack: "#3a2a1f",
  diffRemoveBg: "rgba(255, 90, 90, 0.22)",
  diffRemoveFg: "#ffb3b3",
  diffAddBg: "rgba(80, 200, 120, 0.2)",
  diffAddFg: "#9ce0a8",
  errorBg: "linear-gradient(180deg, rgba(80, 30, 30, 0.58) 0%, rgba(70, 25, 25, 0.68) 100%)",
  errorBorder: "rgba(255, 120, 110, 0.32)",
  errorFg: "#ffb3b3",
  toneSelectedBg: "linear-gradient(135deg, rgba(255, 156, 102, 0.22) 0%, rgba(255, 180, 130, 0.12) 100%)",
  toneSelectedBorder: "#ff9c66",
  toneHoverBg: "rgba(70, 48, 34, 0.85)",
  iconShadow: "0 14px 24px rgba(0, 0, 0, 0.48)",
};

export const THEME_TOKENS: Record<ThemeMode, ThemeTokens> = {
  light: LIGHT_TOKENS,
  dark: DARK_TOKENS,
};

export function tokensToCssVars(mode: ThemeMode): string {
  const t = THEME_TOKENS[mode];
  return `
    --wg-gradient: ${t.gradient};
    --wg-bg-soft: ${t.bgSoft};
    --wg-bg-muted: ${t.bgMuted};
    --wg-card-bg: ${t.cardBg};
    --wg-popup-bg: ${t.popupBg};
    --wg-popup-header-bg: ${t.popupHeaderBg};
    --wg-section-bg: ${t.sectionBg};
    --wg-text: ${t.text};
    --wg-text-secondary: ${t.textSecondary};
    --wg-text-tertiary: ${t.textTertiary};
    --wg-accent-strong: ${t.accentStrong};
    --wg-accent-soft: ${t.accentSoft};
    --wg-link: ${t.link};
    --wg-border: ${t.border};
    --wg-border-soft: ${t.borderSoft};
    --wg-shadow: ${t.shadow};
    --wg-shadow-soft: ${t.shadowSoft};
    --wg-pill-bg: ${t.pillBg};
    --wg-button-secondary-bg: ${t.buttonSecondaryBg};
    --wg-button-secondary-hover-bg: ${t.buttonSecondaryHoverBg};
    --wg-toggle-track: ${t.toggleTrack};
    --wg-focus-ring: ${t.focusRing};
    --wg-glass-highlight: ${t.glassHighlight};
    --wg-surface-raised: ${t.surfaceRaised};
    --wg-gauge-track: ${t.gaugeTrack};
    --wg-diff-remove-bg: ${t.diffRemoveBg};
    --wg-diff-remove-fg: ${t.diffRemoveFg};
    --wg-diff-add-bg: ${t.diffAddBg};
    --wg-diff-add-fg: ${t.diffAddFg};
    --wg-error-bg: ${t.errorBg};
    --wg-error-border: ${t.errorBorder};
    --wg-error-fg: ${t.errorFg};
    --wg-tone-selected-bg: ${t.toneSelectedBg};
    --wg-tone-selected-border: ${t.toneSelectedBorder};
    --wg-tone-hover-bg: ${t.toneHoverBg};
    --wg-icon-shadow: ${t.iconShadow};
  `.trim();
}

export const FONT_TOKENS_CSS = `
  --wg-font-display: ${FONT_DISPLAY};
  --wg-font-body: ${FONT_BODY};
  --wg-font: ${FONT_BODY};
`.trim();

export const SCORE_BADGE_COLORS: Record<string, string> = {
  "#FFD93D": "#c88a00",
};

export function getReadableBadgeBg(color: string): string {
  return SCORE_BADGE_COLORS[color] ?? color;
}
