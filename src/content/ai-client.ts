import { initLanguageModel } from "simple-chromium-ai";
import type { ProofreadResult, RewriteResult, TonePreset } from "../shared/types";
import { getTierForScore } from "../shared/constants";
import {
  DUAL_INITIAL_PROMPTS,
  PROOFREAD_SCHEMA,
  TONE_REWRITE_SCHEMA,
  buildProofreadInstruction,
  buildRewriteInstruction,
} from "../shared/prompts";

type AIInstance = Awaited<ReturnType<typeof initLanguageModel>>;
type AISession = Awaited<ReturnType<AIInstance["createSession"]>>;

let aiInstance: AIInstance | null = null;
let aiInstancePromise: Promise<AIInstance> | null = null;
let testMode = false;

let dualBaseSessionPromise: Promise<AISession> | null = null;
let nextClonePromise: Promise<AISession> | null = null;

// Download progress: null = not downloading. 0..1 while download is in flight.
let downloadProgress: number | null = null;
const progressListeners = new Set<(p: number | null) => void>();

function emitProgress(p: number | null): void {
  downloadProgress = p;
  for (const fn of progressListeners) {
    try {
      fn(p);
    } catch (err) {
      logSessionEvent(`Progress listener threw: ${String(err)}`);
    }
  }
}

export function subscribeDownloadProgress(
  fn: (p: number | null) => void
): () => void {
  progressListeners.add(fn);
  fn(downloadProgress);
  return () => progressListeners.delete(fn);
}

function logSessionEvent(message: string): void {
  console.debug(`[WriteGooderer AI] ${message}`);
}

export async function checkTestMode(): Promise<void> {
  const result = await chrome.storage.local.get("wgTestMode");
  testMode = !!result.wgTestMode;
}

async function ensureModel(): Promise<AIInstance> {
  if (aiInstance) return aiInstance;
  if (aiInstancePromise) return aiInstancePromise;

  let sawProgress = false;
  aiInstancePromise = initLanguageModel({
    monitor(m) {
      m.addEventListener("downloadprogress", (e: Event) => {
        const loaded = (e as ProgressEvent).loaded;
        sawProgress = true;
        logSessionEvent(`Model download progress: ${(loaded * 100).toFixed(1)}%`);
        emitProgress(loaded);
      });
    },
  })
    .then((instance) => {
      aiInstance = instance;
      if (sawProgress) emitProgress(null);
      return instance;
    })
    .catch((err) => {
      aiInstancePromise = null;
      if (sawProgress) emitProgress(null);
      throw err;
    });

  return aiInstancePromise;
}

async function createDualBaseSession(): Promise<AISession> {
  logSessionEvent("Creating dual base session");
  const ai = await ensureModel();
  const session = await ai.createSession({
    initialPrompts: DUAL_INITIAL_PROMPTS as unknown,
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

function refillClonePool(): void {
  if (nextClonePromise) return;
  nextClonePromise = cloneDualSession().catch((err) => {
    logSessionEvent(`Clone pool refill failed: ${String(err)}`);
    nextClonePromise = null;
    throw err;
  });
}

export async function takeClone(): Promise<AISession> {
  if (nextClonePromise) {
    const pending = nextClonePromise;
    nextClonePromise = null;
    try {
      const session = await pending;
      refillClonePool();
      return session;
    } catch {
      // Fall through to a direct clone below.
    }
  }
  const session = await cloneDualSession();
  refillClonePool();
  return session;
}

export async function prewarmSessions(): Promise<void> {
  if (testMode) return;
  logSessionEvent("Prewarming dual base session");
  await getDualBaseSessionPromise();
  logSessionEvent("Prewarmed dual base session");
  refillClonePool();
}

export async function destroySessions(): Promise<void> {
  logSessionEvent("Destroying cached base session");
  const pending = [dualBaseSessionPromise, nextClonePromise];
  dualBaseSessionPromise = null;
  nextClonePromise = null;
  const result = await Promise.allSettled(pending);
  for (const r of result) {
    if (r.status === "fulfilled" && r.value) {
      try {
        r.value.destroy();
      } catch (err) {
        logSessionEvent(`Session destroy failed: ${String(err)}`);
      }
    }
  }
  logSessionEvent("Destroyed cached base session");
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

export async function proofread(
  text: string,
  opts: { signal?: AbortSignal } = {}
): Promise<ProofreadResult> {
  if (testMode) return mockProofread(text);
  const session = await takeClone();
  try {
    logSessionEvent("Proofread: running instruction");
    const raw = await session.prompt(buildProofreadInstruction(text), {
      responseConstraint: PROOFREAD_SCHEMA,
      signal: opts.signal,
    });
    return JSON.parse(raw) as ProofreadResult;
  } finally {
    try {
      session.destroy();
    } catch (err) {
      logSessionEvent(`Proofread session destroy failed: ${String(err)}`);
    }
  }
}

export async function rewrite(
  text: string,
  tone: TonePreset,
  opts: { signal?: AbortSignal } = {}
): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  const session = await takeClone();
  try {
    logSessionEvent(`Rewrite: running instruction for ${tone}`);
    const raw = await session.prompt(buildRewriteInstruction(tone, text), {
      responseConstraint: TONE_REWRITE_SCHEMA,
      signal: opts.signal,
    });
    return JSON.parse(raw) as RewriteResult;
  } finally {
    try {
      session.destroy();
    } catch (err) {
      logSessionEvent(`Rewrite session destroy failed: ${String(err)}`);
    }
  }
}
