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

let downloadProgress: number | null = null;
const progressPorts = new Set<chrome.runtime.Port>();

function logSessionEvent(message: string): void {
  console.debug(`[WriteGooderer offscreen] ${message}`);
}

function emitProgress(p: number | null): void {
  downloadProgress = p;
  for (const port of progressPorts) {
    try {
      port.postMessage({ progress: p });
    } catch (err) {
      logSessionEvent(`Progress post failed: ${String(err)}`);
    }
  }
}

async function loadTestMode(): Promise<void> {
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

async function takeClone(): Promise<AISession> {
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

async function prewarmSessions(): Promise<void> {
  if (testMode) return;
  logSessionEvent("Prewarming dual base session");
  await getDualBaseSessionPromise();
  logSessionEvent("Prewarmed dual base session");
  refillClonePool();
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

async function proofread(
  text: string,
  signal: AbortSignal
): Promise<ProofreadResult> {
  if (testMode) return mockProofread(text);
  const session = await takeClone();
  try {
    logSessionEvent("Proofread: running instruction");
    const raw = await session.prompt(buildProofreadInstruction(text), {
      responseConstraint: PROOFREAD_SCHEMA,
      signal,
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

async function rewrite(
  text: string,
  tone: TonePreset,
  signal: AbortSignal
): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  const session = await takeClone();
  try {
    logSessionEvent(`Rewrite: running instruction for ${tone}`);
    const raw = await session.prompt(buildRewriteInstruction(tone, text), {
      responseConstraint: TONE_REWRITE_SCHEMA,
      signal,
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

function handleProofreadPort(port: chrome.runtime.Port): void {
  const abort = new AbortController();
  port.onDisconnect.addListener(() => abort.abort());
  port.onMessage.addListener(async (msg: { text?: string }) => {
    if (typeof msg?.text !== "string") return;
    try {
      const result = await proofread(msg.text, abort.signal);
      try {
        port.postMessage({ ok: true, result });
      } catch {
        // Port already closed (caller disconnected); ignore.
      }
    } catch (err) {
      try {
        port.postMessage({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      } catch {
        // ignore
      }
    }
  });
}

function handleRewritePort(port: chrome.runtime.Port): void {
  const abort = new AbortController();
  port.onDisconnect.addListener(() => abort.abort());
  port.onMessage.addListener(
    async (msg: { text?: string; tone?: TonePreset }) => {
      if (typeof msg?.text !== "string" || !msg.tone) return;
      try {
        const result = await rewrite(msg.text, msg.tone, abort.signal);
        try {
          port.postMessage({ ok: true, result });
        } catch {
          // ignore
        }
      } catch (err) {
        try {
          port.postMessage({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        } catch {
          // ignore
        }
      }
    }
  );
}

function handleProgressPort(port: chrome.runtime.Port): void {
  progressPorts.add(port);
  port.onDisconnect.addListener(() => progressPorts.delete(port));
  // Replay current state immediately.
  try {
    port.postMessage({ progress: downloadProgress });
  } catch {
    progressPorts.delete(port);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  switch (port.name) {
    case "wg/proofread":
      handleProofreadPort(port);
      return;
    case "wg/rewrite":
      handleRewritePort(port);
      return;
    case "wg/download-progress":
      handleProgressPort(port);
      return;
    default:
      // Not ours — another extension context (e.g. service worker) will handle it.
      return;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("wgTestMode" in changes)) return;
  testMode = !!changes.wgTestMode.newValue;
});

async function main(): Promise<void> {
  await loadTestMode();
  void prewarmSessions().catch((err) => {
    logSessionEvent(`Initial prewarm failed: ${String(err)}`);
  });
}

void main();
