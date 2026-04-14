import { TONES } from "./constants";
import type { TonePreset } from "./types";

export const PROOFREAD_SYSTEM_PROMPT =
  "You are WriteGooderer, a writing assistant. Proofread text for grammar, spelling, punctuation, and clarity. Return corrections, a quality score from 0 to 100, and the matching tier name. Be honest with scoring - perfect text should score 90+, minor issues 60-80, significant issues below 50.";

export const PROOFREAD_INITIAL_PROMPTS: (
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
)[] = [
  { role: "system", content: PROOFREAD_SYSTEM_PROMPT },
  {
    role: "user",
    content: "I has went to the stor yesterday and buyed some mik.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      corrected: "I went to the store yesterday and bought some milk.",
      changes: [
        {
          original: "has went",
          replacement: "went",
          reason: "Incorrect auxiliary verb",
        },
        { original: "stor", replacement: "store", reason: "Spelling" },
        {
          original: "buyed",
          replacement: "bought",
          reason: "Irregular past tense",
        },
        { original: "mik", replacement: "milk", reason: "Spelling" },
      ],
      score: 18,
      tier: "Caveman",
    }),
  },
];

export const PROOFREAD_SCHEMA = {
  type: "object",
  properties: {
    corrected: { type: "string" },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          replacement: { type: "string" },
          reason: { type: "string" },
        },
        required: ["original", "replacement", "reason"],
      },
    },
    score: { type: "number", minimum: 0, maximum: 100 },
    tier: {
      type: "string",
      enum: [
        "Caveman",
        "Txt Msg Veteran",
        "Functional Adult",
        "Word Wizard",
        "Shakespeare Who?",
        "WriteGooderer",
      ],
    },
  },
  required: ["corrected", "changes", "score", "tier"],
};

export const TONE_SYSTEM_PROMPT =
  "You are WriteGooderer. Rewrite text in the specified tone while preserving the core meaning. Be creative and fully commit to the tone.";

export const TONE_INITIAL_PROMPTS: (
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
)[] = [
  { role: "system", content: TONE_SYSTEM_PROMPT },
  {
    role: "user",
    content:
      "Tone: LinkedIn Influencer\n\nText: I got promoted at work today.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      rewritten:
        "I'm thrilled to announce that after years of dedication, countless late nights, and unwavering belief in myself...\n\nI got a promotion.\n\nBut this isn't about the title. It's about the JOURNEY.\n\nHere are 3 lessons I learned along the way:\n\n1. Show up every day\n2. Be authentic\n3. Never stop grinding\n\nAgree? \u{1F447}",
    }),
  },
];

export const TONE_REWRITE_SCHEMA = {
  type: "object",
  properties: {
    rewritten: { type: "string" },
  },
  required: ["rewritten"],
};

export function buildTonePrompt(text: string, tone: TonePreset): string {
  const config = TONES[tone];
  return `Tone: ${config.name} (${config.description})\n\nText: ${text}`;
}
