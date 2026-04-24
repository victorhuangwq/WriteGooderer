import { TONES } from "./constants";
import type { TonePreset } from "./types";

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

export const TONE_REWRITE_SCHEMA = {
  type: "object",
  properties: {
    rewritten: { type: "string" },
  },
  required: ["rewritten"],
};

export const DUAL_SYSTEM_PROMPT =
  "You are WriteGooderer. You handle two tasks on user text: (a) proofread — return corrections, a 0-100 quality score, and a tier name; (b) rewrite in a specified tone — preserve meaning, commit fully to the tone. Respond only with JSON matching the requested schema. Honest scoring: perfect text 90+, minor issues 60-80, significant issues below 50.";

export const DUAL_INITIAL_PROMPTS: (
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
)[] = [
  { role: "system", content: DUAL_SYSTEM_PROMPT },
  {
    role: "user",
    content:
      "Proofread this paragraph:\n\nI has went to the stor yesterday and buyed some mik.",
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
  {
    role: "user",
    content:
      "Rewrite this paragraph in this tone: LinkedIn Influencer (performative self-help hustle energy).\n\nParagraph:\n\nI got promoted at work today.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      rewritten:
        "I'm thrilled to announce that after years of dedication, countless late nights, and unwavering belief in myself...\n\nI got a promotion.\n\nBut this isn't about the title. It's about the JOURNEY.\n\nHere are 3 lessons I learned along the way:\n\n1. Show up every day\n2. Be authentic\n3. Never stop grinding\n\nAgree? \u{1F447}",
    }),
  },
];

export function buildProofreadInstruction(text: string): string {
  return `Proofread this paragraph:\n\n${text}`;
}

export function buildRewriteInstruction(tone: TonePreset, text: string): string {
  const config = TONES[tone];
  return `Rewrite this paragraph in this tone: ${config.name} (${config.description}).\n\nParagraph:\n\n${text}`;
}
