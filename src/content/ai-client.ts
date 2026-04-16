import ChromiumAI from "simple-chromium-ai";
import type { ChromiumAIInstance } from "simple-chromium-ai";
import type { ProofreadResult, RewriteResult, TonePreset } from "../shared/types";
import { getTierForScore } from "../shared/constants";
import {
  PROOFREAD_INITIAL_PROMPTS,
  PROOFREAD_SCHEMA,
  TONE_INITIAL_PROMPTS,
  TONE_REWRITE_SCHEMA,
  buildTonePrompt,
} from "../shared/prompts";

let aiInstance: ChromiumAIInstance | null = null;
let testMode = false;

export async function checkTestMode(): Promise<void> {
  const result = await chrome.storage.local.get("wgTestMode");
  testMode = !!result.wgTestMode;
}

async function ensureModel(): Promise<ChromiumAIInstance> {
  if (testMode) return { systemPrompt: "test", instanceId: "test" };
  if (aiInstance) return aiInstance;
  aiInstance = await ChromiumAI.initialize();
  return aiInstance;
}

function mockProofread(text: string): ProofreadResult {
  const changes: ProofreadResult["changes"] = [];
  if (text.includes("has went")) {
    changes.push({ original: "has went", replacement: "went", reason: "Incorrect auxiliary verb" });
  }
  if (text.includes("buyed")) {
    changes.push({ original: "buyed", replacement: "bought", reason: "Irregular past tense" });
  }
  if (text.includes("stor ")) {
    changes.push({ original: "stor", replacement: "store", reason: "Spelling" });
  }
  if (text.includes("mik")) {
    changes.push({ original: "mik", replacement: "milk", reason: "Spelling" });
  }

  let corrected = text;
  for (const c of changes) {
    corrected = corrected.replace(c.original, c.replacement);
  }

  const score = changes.length === 0 ? 92 : Math.max(5, 80 - changes.length * 15);
  const tier = getTierForScore(score);
  return { corrected, changes, score, tier: tier.name };
}

function mockRewrite(text: string, tone: string): RewriteResult {
  return { rewritten: `[${tone.toUpperCase()}] ${text}` };
}

export async function proofread(text: string): Promise<ProofreadResult> {
  if (testMode) return mockProofread(text);
  const ai = await ensureModel();
  const session = await ChromiumAI.createSession(ai, {
    initialPrompts: PROOFREAD_INITIAL_PROMPTS as any,
  });
  try {
    const raw = await session.prompt(text, {
      responseConstraint: PROOFREAD_SCHEMA,
    });
    return JSON.parse(raw) as ProofreadResult;
  } finally {
    session.destroy();
  }
}

export async function rewrite(text: string, tone: TonePreset): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  const ai = await ensureModel();
  const session = await ChromiumAI.createSession(ai, {
    initialPrompts: TONE_INITIAL_PROMPTS as any,
  });
  try {
    const prompt = buildTonePrompt(text, tone);
    const raw = await session.prompt(prompt, {
      responseConstraint: TONE_REWRITE_SCHEMA,
    });
    return JSON.parse(raw) as RewriteResult;
  } finally {
    session.destroy();
  }
}
