import type { ScoreTier, TonePreset } from "./types";

export interface ToneConfig {
  name: string;
  description: string;
  subtitle: string;
  emoji: string;
}

export const TONES: Record<TonePreset, ToneConfig> = {
  professional: {
    name: "Professional",
    description:
      "Formal, clear, and business-appropriate. No slang or contractions.",
    subtitle: "Boardroom ready",
    emoji: "💼",
  },
  casual: {
    name: "Casual",
    description: "Relaxed, conversational, like texting a friend.",
    subtitle: "Chill vibes",
    emoji: "🛋️",
  },
  friendly: {
    name: "Friendly",
    description: "Warm, approachable, with positive energy.",
    subtitle: "Good neighbor",
    emoji: "🤗",
  },
  confident: {
    name: "Confident",
    description: "Assertive, decisive, no hedging or qualifiers.",
    subtitle: "No doubts",
    emoji: "💪",
  },
  "linkedin-influencer": {
    name: "LinkedIn Influencer",
    description:
      'Inspirational, uses lots of line breaks, starts with a hook, ends with "Agree?"',
    subtitle: "Thought leader",
    emoji: "📈",
  },
  "passive-aggressive": {
    name: "Passive Aggressive",
    description:
      'Polite on the surface with underlying tension. "Per my last email" energy.',
    subtitle: "Per my last email",
    emoji: "😒",
  },
  "overly-enthusiastic": {
    name: "Overly Enthusiastic",
    description:
      "EXCITED about EVERYTHING!!! Liberal use of exclamation marks!!!",
    subtitle: "SO EXCITED!!!",
    emoji: "🤩",
  },
  "corporate-buzzword": {
    name: "Corporate Buzzword",
    description:
      "Leverage synergies, move the needle, circle back, paradigm shift.",
    subtitle: "Synergy unlocked",
    emoji: "📊",
  },
};

export interface ScoreTierConfig {
  name: ScoreTier;
  min: number;
  max: number;
  color: string;
  emoji: string;
}

export const PERFECT_SCORE_THRESHOLD = 96;

export const SCORE_TIERS: ScoreTierConfig[] = [
  { name: "Caveman", min: 0, max: 20, color: "#FF6B6B", emoji: "🪨" },
  { name: "Txt Msg Veteran", min: 21, max: 40, color: "#FFA07A", emoji: "📱" },
  { name: "Functional Adult", min: 41, max: 60, color: "#FFD93D", emoji: "☕" },
  { name: "Word Wizard", min: 61, max: 80, color: "#4ECDC4", emoji: "🧙" },
  { name: "Shakespeare Who?", min: 81, max: 95, color: "#2ECC71", emoji: "🎭" },
  { name: "WriteGooderer", min: 96, max: 100, color: "#27AE60", emoji: "👑" },
];

export function getTierForScore(score: number): ScoreTierConfig {
  for (const tier of SCORE_TIERS) {
    if (score >= tier.min && score <= tier.max) {
      return tier;
    }
  }
  return SCORE_TIERS[0];
}

export const LOADING_QUIPS: string[] = [
  "Consulting the AI overlord...",
  "Making your words gooderer...",
  "Judging your grammar silently...",
  "Downloading more vocabulary...",
  "Asking Gemini Nano nicely...",
  "Crunching linguistic algorithms...",
  "Your CPU is working harder than you did on this text...",
  "Teaching electrons to spell...",
  "Bribing the language model...",
  "Reticulating splines... wait, wrong program...",
  "Channeling the spirit of your English teacher...",
  "Googling 'how to grammar'... just kidding...",
  "Running 4 billion parameters for your 12 words...",
  "Thinking really hard on your behalf...",
  "Pretending to be a $30/month writing tool...",
];
