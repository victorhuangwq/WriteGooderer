import ChromiumAI from "simple-chromium-ai";
import type { ChromiumAIInstance } from "simple-chromium-ai";
import type { MessageRequest, MessageResponse } from "../shared/messages";
import type { ModelStatus, ProofreadResult, RewriteResult } from "../shared/types";
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

async function initModel(): Promise<void> {
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
  await initModel();
  if (!aiInstance) {
    throw new Error(
      "Chrome AI is not available. Make sure you have Chrome 138+ with the Prompt API flag enabled."
    );
  }
  return aiInstance;
}

async function handleProofread(text: string): Promise<ProofreadResult> {
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
    message: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    (async () => {
      try {
        switch (message.type) {
          case "WARM_UP": {
            await initModel();
            sendResponse({ status: modelStatus });
            break;
          }
          case "GET_MODEL_STATUS": {
            sendResponse({ status: modelStatus });
            break;
          }
          case "PROOFREAD": {
            const result = await handleProofread(message.text);
            sendResponse({ success: true, result });
            break;
          }
          case "REWRITE_TONE": {
            const result = await handleRewrite(message.text, message.tone);
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
    return true; // keep message channel open for async response
  }
);

console.log("[WriteGooderer] Service worker loaded");
