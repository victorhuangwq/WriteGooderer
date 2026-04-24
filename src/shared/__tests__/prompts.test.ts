import { describe, it, expect } from "vitest";
import {
  DUAL_INITIAL_PROMPTS,
  DUAL_SYSTEM_PROMPT,
  PROOFREAD_SCHEMA,
  TONE_REWRITE_SCHEMA,
  buildProofreadInstruction,
  buildRewriteInstruction,
} from "../prompts";
import type { TonePreset } from "../types";

describe("buildProofreadInstruction", () => {
  it("includes the user text", () => {
    const result = buildProofreadInstruction("I has went to the stor.");
    expect(result).toContain("I has went to the stor.");
    expect(result.toLowerCase()).toContain("proofread");
  });
});

describe("buildRewriteInstruction", () => {
  it("includes the tone name, description, and user text", () => {
    const text = "I got promoted at work today.";
    const result = buildRewriteInstruction("professional", text);
    expect(result).toContain("Professional");
    expect(result).toContain("Formal, clear, and business-appropriate");
    expect(result).toContain(text);
  });

  it("works for all tone presets", () => {
    const tones: TonePreset[] = [
      "professional",
      "casual",
      "friendly",
      "confident",
      "linkedin-influencer",
      "passive-aggressive",
      "overly-enthusiastic",
      "corporate-buzzword",
    ];
    for (const tone of tones) {
      const result = buildRewriteInstruction(tone, "test text");
      expect(result).toContain("test text");
    }
  });
});

describe("DUAL_INITIAL_PROMPTS", () => {
  it("starts with the dual system message", () => {
    expect(DUAL_INITIAL_PROMPTS[0].role).toBe("system");
    expect(DUAL_INITIAL_PROMPTS[0].content).toBe(DUAL_SYSTEM_PROMPT);
  });

  it("contains single-turn instruction → JSON pairs (no intermediate READY)", () => {
    for (const entry of DUAL_INITIAL_PROMPTS) {
      expect(entry.content).not.toBe("READY");
    }
  });

  it("each user turn carries both an instruction and the paragraph inline", () => {
    const userTurns = DUAL_INITIAL_PROMPTS.filter((p) => p.role === "user");
    expect(userTurns.length).toBeGreaterThan(0);
    for (const turn of userTurns) {
      expect(turn.content.length).toBeGreaterThan(20);
      // Must not be a bare "Paragraph: ..." prompt (the pattern that caused
      // the warmup to complete into a full JSON response).
      expect(turn.content.startsWith("Paragraph:")).toBe(false);
    }
  });

  it("proofread few-shot assistant response parses into a valid result shape", () => {
    const proofreadAssistant = DUAL_INITIAL_PROMPTS.find(
      (p, i) =>
        p.role === "assistant" &&
        DUAL_INITIAL_PROMPTS[i - 1]?.role === "user" &&
        DUAL_INITIAL_PROMPTS[i - 1]?.content.toLowerCase().includes("proofread")
    );
    expect(proofreadAssistant).toBeDefined();
    const parsed = JSON.parse(proofreadAssistant!.content);
    expect(parsed).toHaveProperty("corrected");
    expect(parsed).toHaveProperty("changes");
    expect(parsed).toHaveProperty("score");
    expect(parsed).toHaveProperty("tier");
    expect(Array.isArray(parsed.changes)).toBe(true);
    expect(typeof parsed.score).toBe("number");
  });

  it("rewrite few-shot assistant response parses into a valid result shape", () => {
    const rewriteAssistant = DUAL_INITIAL_PROMPTS.find(
      (p, i) =>
        p.role === "assistant" &&
        DUAL_INITIAL_PROMPTS[i - 1]?.role === "user" &&
        DUAL_INITIAL_PROMPTS[i - 1]?.content.toLowerCase().includes("rewrite")
    );
    expect(rewriteAssistant).toBeDefined();
    const parsed = JSON.parse(rewriteAssistant!.content);
    expect(parsed).toHaveProperty("rewritten");
    expect(typeof parsed.rewritten).toBe("string");
  });
});

describe("DUAL_SYSTEM_PROMPT", () => {
  it("does not mention the retired READY protocol", () => {
    expect(DUAL_SYSTEM_PROMPT).not.toMatch(/READY/);
  });
});

describe("PROOFREAD_SCHEMA", () => {
  it("requires corrected, changes, score, and tier", () => {
    expect(PROOFREAD_SCHEMA.required).toContain("corrected");
    expect(PROOFREAD_SCHEMA.required).toContain("changes");
    expect(PROOFREAD_SCHEMA.required).toContain("score");
    expect(PROOFREAD_SCHEMA.required).toContain("tier");
  });

  it("score has min 0 and max 100", () => {
    const scoreSchema = PROOFREAD_SCHEMA.properties.score as any;
    expect(scoreSchema.minimum).toBe(0);
    expect(scoreSchema.maximum).toBe(100);
  });

  it("tier enum matches the SCORE_TIERS names", () => {
    const tierSchema = PROOFREAD_SCHEMA.properties.tier as any;
    expect(tierSchema.enum).toContain("Caveman");
    expect(tierSchema.enum).toContain("WriteGooderer");
    expect(tierSchema.enum).toHaveLength(6);
  });
});

describe("TONE_REWRITE_SCHEMA", () => {
  it("requires only the rewritten field", () => {
    expect(TONE_REWRITE_SCHEMA.required).toEqual(["rewritten"]);
    expect(TONE_REWRITE_SCHEMA.properties.rewritten.type).toBe("string");
  });
});
