import { describe, it, expect } from "vitest";
import {
  buildTonePrompt,
  PROOFREAD_INITIAL_PROMPTS,
  PROOFREAD_SCHEMA,
  TONE_INITIAL_PROMPTS,
  TONE_REWRITE_SCHEMA,
} from "../prompts";
import type { TonePreset } from "../types";

describe("buildTonePrompt", () => {
  it("includes the tone name and description", () => {
    const result = buildTonePrompt("Hello world", "professional");
    expect(result).toContain("Professional");
    expect(result).toContain("Formal, clear, and business-appropriate");
  });

  it("includes the user text", () => {
    const text = "I got promoted at work today.";
    const result = buildTonePrompt(text, "casual");
    expect(result).toContain(text);
  });

  it("formats as 'Tone: ... Text: ...'", () => {
    const result = buildTonePrompt("test", "linkedin-influencer");
    expect(result).toMatch(/^Tone: .+\n\nText: .+$/s);
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
      const result = buildTonePrompt("test text", tone);
      expect(result).toContain("Tone:");
      expect(result).toContain("test text");
    }
  });
});

describe("PROOFREAD_INITIAL_PROMPTS", () => {
  it("starts with a system message", () => {
    expect(PROOFREAD_INITIAL_PROMPTS[0].role).toBe("system");
  });

  it("has a user/assistant few-shot pair", () => {
    expect(PROOFREAD_INITIAL_PROMPTS[1].role).toBe("user");
    expect(PROOFREAD_INITIAL_PROMPTS[2].role).toBe("assistant");
  });

  it("the assistant response is valid JSON matching the schema", () => {
    const parsed = JSON.parse(PROOFREAD_INITIAL_PROMPTS[2].content);
    expect(parsed).toHaveProperty("corrected");
    expect(parsed).toHaveProperty("changes");
    expect(parsed).toHaveProperty("score");
    expect(parsed).toHaveProperty("tier");
    expect(Array.isArray(parsed.changes)).toBe(true);
    expect(typeof parsed.score).toBe("number");
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

describe("TONE_INITIAL_PROMPTS", () => {
  it("starts with a system message", () => {
    expect(TONE_INITIAL_PROMPTS[0].role).toBe("system");
  });

  it("the assistant response is valid JSON with a rewritten field", () => {
    const parsed = JSON.parse(TONE_INITIAL_PROMPTS[2].content);
    expect(parsed).toHaveProperty("rewritten");
    expect(typeof parsed.rewritten).toBe("string");
  });
});

describe("TONE_REWRITE_SCHEMA", () => {
  it("requires only the rewritten field", () => {
    expect(TONE_REWRITE_SCHEMA.required).toEqual(["rewritten"]);
    expect(TONE_REWRITE_SCHEMA.properties.rewritten.type).toBe("string");
  });
});
