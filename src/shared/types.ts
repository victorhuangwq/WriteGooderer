export type ModelStatus = "loading" | "ready" | "error" | "unavailable";

export type TonePreset =
  | "professional"
  | "casual"
  | "friendly"
  | "confident"
  | "linkedin-influencer"
  | "passive-aggressive"
  | "overly-enthusiastic"
  | "corporate-buzzword";

export type ScoreTier =
  | "Caveman"
  | "Txt Msg Veteran"
  | "Functional Adult"
  | "Word Wizard"
  | "Shakespeare Who?"
  | "WriteGooderer";

export interface ProofreadChange {
  original: string;
  replacement: string;
  reason: string;
}

export interface ProofreadResult {
  corrected: string;
  changes: ProofreadChange[];
  score: number;
  tier: ScoreTier;
}

export interface RewriteResult {
  rewritten: string;
}

export interface UserPreferences {
  lastTone: TonePreset;
  disabledSites: string[];
}
