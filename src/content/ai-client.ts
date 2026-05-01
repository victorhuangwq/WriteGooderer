import type { ProofreadResult, RewriteResult, TonePreset } from "../shared/types";
import { getTierForScore } from "../shared/constants";

let testMode = false;
let ensureOffscreenPromise: Promise<void> | null = null;

function logEvent(message: string): void {
  console.debug(`[WriteGooderer AI] ${message}`);
}

export async function checkTestMode(): Promise<void> {
  const result = await chrome.storage.local.get("wgTestMode");
  testMode = !!result.wgTestMode;
}

function ensureOffscreen(): Promise<void> {
  if (ensureOffscreenPromise) return ensureOffscreenPromise;
  ensureOffscreenPromise = chrome.runtime
    .sendMessage({ type: "wg/ensure-offscreen" })
    .then((resp: { ok?: boolean; error?: string } | undefined) => {
      if (!resp?.ok) {
        throw new Error(resp?.error || "Failed to start offscreen document");
      }
    })
    .catch((err) => {
      ensureOffscreenPromise = null;
      throw err;
    });
  return ensureOffscreenPromise;
}

function runOnPort<TReq, TRes>(
  name: string,
  request: TReq,
  signal?: AbortSignal
): Promise<TRes> {
  return new Promise<TRes>((resolve, reject) => {
    let port: chrome.runtime.Port;
    try {
      port = chrome.runtime.connect({ name });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const onAbort = () => {
      settle(() => {
        try {
          port.disconnect();
        } catch {
          // ignore
        }
        reject(new DOMException("Aborted", "AbortError"));
      });
    };

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    port.onMessage.addListener((msg: { ok?: boolean; result?: TRes; error?: string }) => {
      if (msg?.ok) {
        settle(() => {
          signal?.removeEventListener("abort", onAbort);
          try {
            port.disconnect();
          } catch {
            // ignore
          }
          resolve(msg.result as TRes);
        });
      } else {
        settle(() => {
          signal?.removeEventListener("abort", onAbort);
          try {
            port.disconnect();
          } catch {
            // ignore
          }
          reject(new Error(msg?.error || "Request failed"));
        });
      }
    });

    port.onDisconnect.addListener(() => {
      settle(() => {
        signal?.removeEventListener("abort", onAbort);
        const err = chrome.runtime.lastError;
        reject(new Error(err?.message || "Offscreen disconnected"));
      });
    });

    try {
      port.postMessage(request);
    } catch (err) {
      settle(() => {
        signal?.removeEventListener("abort", onAbort);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    }
  });
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

export async function prewarmSessions(): Promise<void> {
  if (testMode) return;
  // Triggering offscreen creation is enough — the offscreen prewarms itself on startup.
  await ensureOffscreen();
}

export async function proofread(
  text: string,
  opts: { signal?: AbortSignal } = {}
): Promise<ProofreadResult> {
  if (testMode) return mockProofread(text);
  await ensureOffscreen();
  logEvent("Proofread: dispatching to offscreen");
  return runOnPort<{ text: string }, ProofreadResult>(
    "wg/proofread",
    { text },
    opts.signal
  );
}

export async function rewrite(
  text: string,
  tone: TonePreset,
  opts: { signal?: AbortSignal } = {}
): Promise<RewriteResult> {
  if (testMode) return mockRewrite(text, tone);
  await ensureOffscreen();
  logEvent(`Rewrite: dispatching to offscreen for ${tone}`);
  return runOnPort<{ text: string; tone: TonePreset }, RewriteResult>(
    "wg/rewrite",
    { text, tone },
    opts.signal
  );
}

export function subscribeDownloadProgress(
  fn: (p: number | null) => void
): () => void {
  let port: chrome.runtime.Port | null = null;
  let cancelled = false;

  void ensureOffscreen()
    .then(() => {
      if (cancelled) return;
      port = chrome.runtime.connect({ name: "wg/download-progress" });
      port.onMessage.addListener((msg: { progress?: number | null }) => {
        if (cancelled) return;
        try {
          fn(msg?.progress ?? null);
        } catch (err) {
          logEvent(`Progress listener threw: ${String(err)}`);
        }
      });
      port.onDisconnect.addListener(() => {
        port = null;
      });
    })
    .catch((err) => {
      logEvent(`Progress subscribe failed: ${String(err)}`);
    });

  return () => {
    cancelled = true;
    try {
      port?.disconnect();
    } catch {
      // ignore
    }
    port = null;
  };
}
