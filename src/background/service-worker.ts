import ChromiumAI from "simple-chromium-ai";
import type { ChromiumAIInstance } from "simple-chromium-ai";
import type { MessageRequest, MessageResponse } from "../shared/messages";
import type { ModelStatus, ProofreadResult, RewriteResult } from "../shared/types";
import { getTierForScore } from "../shared/constants";
import {
  PROOFREAD_INITIAL_PROMPTS,
  PROOFREAD_SCHEMA,
  TONE_INITIAL_PROMPTS,
  TONE_REWRITE_SCHEMA,
  buildTonePrompt,
} from "../shared/prompts";

let aiInstance: ChromiumAIInstance | null = null;
let modelStatus: ModelStatus = "loading";
let initPromise: Promise<void> | null = null;
let testMode = false;

async function initModel(): Promise<void> {
  if (testMode) {
    modelStatus = "ready";
    return;
  }
  if (aiInstance) {
    modelStatus = "ready";
    return;
  }
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async () => {
    try {
      modelStatus = "loading";
      aiInstance = await ChromiumAI.initialize();
      modelStatus = "ready";
      console.log("[WriteGooderer] Model initialized");
    } catch (err) {
      modelStatus = "unavailable";
      aiInstance = null;
      console.error("[WriteGooderer] Model init failed:", err);
    } finally {
      initPromise = null;
    }
  })();
  return initPromise;
}

async function ensureModel(): Promise<ChromiumAIInstance> {
  if (testMode) {
    modelStatus = "ready";
    return { systemPrompt: "test", instanceId: "test" };
  }
  await initModel();
  if (!aiInstance) {
    throw new Error(
      "Chrome AI is not available. Make sure you have Chrome 138+ with the Prompt API flag enabled."
    );
  }
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

async function handleProofread(text: string): Promise<ProofreadResult> {
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

async function handleRewrite(
  text: string,
  tone: import("../shared/types").TonePreset
): Promise<RewriteResult> {
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

chrome.runtime.onMessage.addListener(
  (
    message: MessageRequest | { type: "SET_TEST_MODE" },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse | { testMode: boolean }) => void
  ) => {
    (async () => {
      try {
        switch (message.type) {
          case "SET_TEST_MODE": {
            testMode = true;
            modelStatus = "ready";
            sendResponse({ testMode: true });
            break;
          }
          case "GET_MODEL_STATUS": {
            sendResponse({ status: modelStatus });
            break;
          }
          case "PROOFREAD": {
            const result = await handleProofread(
              (message as any).text
            );
            sendResponse({ success: true, result });
            break;
          }
          case "REWRITE_TONE": {
            const result = await handleRewrite(
              (message as any).text,
              (message as any).tone
            );
            sendResponse({ success: true, result });
            break;
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unknown error occurred";
        sendResponse({ success: false, error: errorMsg });
      }
    })();
    return true;
  }
);

console.log("[WriteGooderer] Service worker loaded");
