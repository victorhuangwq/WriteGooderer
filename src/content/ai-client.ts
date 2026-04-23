import ChromiumAI from "simple-chromium-ai";
import type { ChromiumAIInstance } from "simple-chromium-ai";
import type { ProofreadResult, RewriteResult, TonePreset } from "../shared/types";
import { getTierForScore } from "../shared/constants";
import {
  DUAL_INITIAL_PROMPTS,
  PROOFREAD_SCHEMA,
  TONE_REWRITE_SCHEMA,
  buildProofreadInstruction,
  buildRewriteInstruction,
  buildWarmupPrompt,
} from "../shared/prompts";

const WARMUP_MAX_CHARS = 1500;

let aiInstance: ChromiumAIInstance | null = null;
let testMode = false;
type AISession = Awaited<ReturnType<typeof ChromiumAI.createSession>>;

let dualBaseSessionPromise: Promise<AISession> | null = null;

export type WarmClone = {
  session: AISession;
  warmup: Promise<void>;
  text: string;
  dispose: () => void;
};

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

async function createDualBaseSession(): Promise<AISession> {
  logSessionEvent("Creating dual base session");
  const ai = await ensureModel();
  const session = await ChromiumAI.createSession(ai, {
    initialPrompts: DUAL_INITIAL_PROMPTS as any,
  });
  logSessionEvent("Created dual base session");
  return session;
}

function getDualBaseSessionPromise(): Promise<AISession> {
  if (dualBaseSessionPromise) return dualBaseSessionPromise;

  const sessionPromise = createDualBaseSession().catch((error) => {
    logSessionEvent(`Dual base session creation failed: ${String(error)}`);
    dualBaseSessionPromise = null;
    throw error;
  });

  dualBaseSessionPromise = sessionPromise;
  return sessionPromise;
}

async function cloneDualSession(): Promise<AISession> {
  try {
    const baseSession = await getDualBaseSessionPromise();
    logSessionEvent("Cloning dual session");
    const clonedSession = await baseSession.clone();
    logSessionEvent("Cloned dual session");
    return clonedSession;
  } catch (error) {
    logSessionEvent(`Clone failed, rebuilding dual base session: ${String(error)}`);
    dualBaseSessionPromise = null;
    const rebuiltSession = await getDualBaseSessionPromise();
    const clonedSession = await rebuiltSession.clone();
    logSessionEvent("Rebuilt and cloned dual session");
    return clonedSession;
  }
}

export async function prewarmSessions(): Promise<void> {
  if (testMode) return;
  logSessionEvent("Prewarming dual base session");
  await getDualBaseSessionPromise();
  logSessionEvent("Prewarmed dual base session");
}

export async function destroySessions(): Promise<void> {
  logSessionEvent("Destroying cached base session");
  const result = await Promise.allSettled([dualBaseSessionPromise]);
  for (const r of result) {
    if (r.status === "fulfilled" && r.value) {
      r.value.destroy();
    }
  }
  dualBaseSessionPromise = null;
  logSessionEvent("Destroyed cached base session");
}

export function canWarmText(text: string): boolean {
  if (testMode) return false;
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= WARMUP_MAX_CHARS;
}

export async function warmCloneForText(text: string): Promise<WarmClone> {
  const session = await cloneDualSession();
  let disposed = false;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    try {
      session.destroy();
      logSessionEvent("Disposed warm clone");
    } catch (err) {
      logSessionEvent(`Warm clone dispose failed: ${String(err)}`);
    }
  };

  logSessionEvent("Warm clone: prompting paragraph");
  const warmup = session
    .prompt(buildWarmupPrompt(text))
    .then(() => {
      logSessionEvent("Warm clone: paragraph ingested");
    })
    .catch((err: unknown) => {
      logSessionEvent(`Warm clone prompt failed: ${String(err)}`);
      throw err;
    });

  return { session, warmup, text, dispose };
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

export async function finalizeProofread(warm: WarmClone): Promise<ProofreadResult> {
  try {
    logSessionEvent("Finalize proofread: awaiting warmup");
    await warm.warmup;
    logSessionEvent("Finalize proofread: running instruction");
    const raw = await warm.session.prompt(buildProofreadInstruction(), {
      responseConstraint: PROOFREAD_SCHEMA,
    });
    return JSON.parse(raw) as ProofreadResult;
  } finally {
    warm.dispose();
  }
}

export async function finalizeRewrite(
  warm: WarmClone,
  tone: TonePreset
): Promise<RewriteResult> {
  try {
    logSessionEvent("Finalize rewrite: awaiting warmup");
    await warm.warmup;
    logSessionEvent(`Finalize rewrite: running instruction for ${tone}`);
    const raw = await warm.session.prompt(buildRewriteInstruction(tone), {
      responseConstraint: TONE_REWRITE_SCHEMA,
    });
    return JSON.parse(raw) as RewriteResult;
  } finally {
    warm.dispose();
  }
}

export async function proofread(text: string): Promise<ProofreadResult> {
  if (testMode) return mockProofread(text);
  try {
    const warm = await warmCloneForText(text);
    return await finalizeProofread(warm);
  } catch (err) {
    logSessionEvent(`Proofread wrapper failed, falling back: ${String(err)}`);
    const session = await cloneDualSession();
    try {
      const raw = await session.prompt(
        `${buildWarmupPrompt(text)}\n\n${buildProofreadInstruction()}`,
        { responseConstraint: PROOFREAD_SCHEMA }
      );
      return JSON.parse(raw) as ProofreadResult;
    } finally {
      session.destroy();
    }
  }
}

export async function rewrite(text: string, tone: TonePreset): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  try {
    const warm = await warmCloneForText(text);
    return await finalizeRewrite(warm, tone);
  } catch (err) {
    logSessionEvent(`Rewrite wrapper failed, falling back: ${String(err)}`);
    const session = await cloneDualSession();
    try {
      const raw = await session.prompt(
        `${buildWarmupPrompt(text)}\n\n${buildRewriteInstruction(tone)}`,
        { responseConstraint: TONE_REWRITE_SCHEMA }
      );
      return JSON.parse(raw) as RewriteResult;
    } finally {
      session.destroy();
    }
  }
}
