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
type AISession = Awaited<ReturnType<typeof ChromiumAI.createSession>>;

let proofreadBaseSessionPromise: Promise<AISession> | null = null;
let toneBaseSessionPromise: Promise<AISession> | null = null;

function logSessionEvent(message: string): void {
  console.debug(`[WriteGooderer AI] ${message}`);
}

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

async function createBaseSession(
  kind: "proofread" | "tone",
  initialPrompts: typeof PROOFREAD_INITIAL_PROMPTS
): Promise<AISession> {
  logSessionEvent(`Creating base ${kind} session`);
  const ai = await ensureModel();
  const session = await ChromiumAI.createSession(ai, {
    initialPrompts: initialPrompts as any,
  });
  logSessionEvent(`Created base ${kind} session`);
  return session;
}

function getBaseSessionPromise(kind: "proofread" | "tone"): Promise<AISession> {
  const existingPromise =
    kind === "proofread" ? proofreadBaseSessionPromise : toneBaseSessionPromise;
  if (existingPromise) return existingPromise;

  const initialPrompts =
    kind === "proofread" ? PROOFREAD_INITIAL_PROMPTS : TONE_INITIAL_PROMPTS;

  const sessionPromise = createBaseSession(kind, initialPrompts).catch((error) => {
    logSessionEvent(`Base ${kind} session creation failed: ${String(error)}`);
    if (kind === "proofread") {
      proofreadBaseSessionPromise = null;
    } else {
      toneBaseSessionPromise = null;
    }
    throw error;
  });

  if (kind === "proofread") {
    proofreadBaseSessionPromise = sessionPromise;
  } else {
    toneBaseSessionPromise = sessionPromise;
  }

  return sessionPromise;
}

async function cloneSession(kind: "proofread" | "tone"): Promise<AISession> {
  try {
    const baseSession = await getBaseSessionPromise(kind);
    logSessionEvent(`Cloning ${kind} session`);
    const clonedSession = await baseSession.clone();
    logSessionEvent(`Cloned ${kind} session`);
    return clonedSession;
  } catch (error) {
    logSessionEvent(`Clone failed for ${kind}, rebuilding base session: ${String(error)}`);
    if (kind === "proofread") {
      proofreadBaseSessionPromise = null;
    } else {
      toneBaseSessionPromise = null;
    }

    const rebuiltSession = await getBaseSessionPromise(kind);
    const clonedSession = await rebuiltSession.clone();
    logSessionEvent(`Rebuilt and cloned ${kind} session`);
    return clonedSession;
  }
}

export async function prewarmSessions(): Promise<void> {
  if (testMode) return;

  logSessionEvent("Prewarming proofread and tone base sessions");
  await Promise.all([
    getBaseSessionPromise("proofread"),
    getBaseSessionPromise("tone"),
  ]);
  logSessionEvent("Prewarmed proofread and tone base sessions");
}

export async function destroySessions(): Promise<void> {
  logSessionEvent("Destroying cached base sessions");
  const sessions = await Promise.allSettled([
    proofreadBaseSessionPromise,
    toneBaseSessionPromise,
  ]);

  for (const result of sessions) {
    if (result.status === "fulfilled" && result.value) {
      result.value.destroy();
    }
  }

  proofreadBaseSessionPromise = null;
  toneBaseSessionPromise = null;
  logSessionEvent("Destroyed cached base sessions");
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
  const session = await cloneSession("proofread");
  try {
    logSessionEvent("Running proofread prompt");
    const raw = await session.prompt(text, {
      responseConstraint: PROOFREAD_SCHEMA,
    });
    return JSON.parse(raw) as ProofreadResult;
  } finally {
    logSessionEvent("Destroying proofread clone");
    session.destroy();
  }
}

export async function rewrite(text: string, tone: TonePreset): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  const session = await cloneSession("tone");
  try {
    const prompt = buildTonePrompt(text, tone);
    logSessionEvent(`Running tone rewrite prompt for ${tone}`);
    const raw = await session.prompt(prompt, {
      responseConstraint: TONE_REWRITE_SCHEMA,
    });
    return JSON.parse(raw) as RewriteResult;
  } finally {
    logSessionEvent("Destroying tone clone");
    session.destroy();
  }
}
