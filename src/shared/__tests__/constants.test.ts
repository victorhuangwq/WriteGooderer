import { describe, it, expect } from "vitest";
import { getTierForScore, SCORE_TIERS, TONES, LOADING_QUIPS } from "../constants";

describe("getTierForScore", () => {
  it("returns Caveman for scores 0-20", () => {
    expect(getTierForScore(0).name).toBe("Caveman");
    expect(getTierForScore(10).name).toBe("Caveman");
    expect(getTierForScore(20).name).toBe("Caveman");
  });

  it("returns Txt Msg Veteran for scores 21-40", () => {
    expect(getTierForScore(21).name).toBe("Txt Msg Veteran");
    expect(getTierForScore(30).name).toBe("Txt Msg Veteran");
    expect(getTierForScore(40).name).toBe("Txt Msg Veteran");
  });

  it("returns Functional Adult for scores 41-60", () => {
    expect(getTierForScore(41).name).toBe("Functional Adult");
    expect(getTierForScore(50).name).toBe("Functional Adult");
    expect(getTierForScore(60).name).toBe("Functional Adult");
  });

  it("returns Word Wizard for scores 61-80", () => {
    expect(getTierForScore(61).name).toBe("Word Wizard");
    expect(getTierForScore(70).name).toBe("Word Wizard");
    expect(getTierForScore(80).name).toBe("Word Wizard");
  });

  it("returns Shakespeare Who? for scores 81-95", () => {
    expect(getTierForScore(81).name).toBe("Shakespeare Who?");
    expect(getTierForScore(90).name).toBe("Shakespeare Who?");
    expect(getTierForScore(95).name).toBe("Shakespeare Who?");
  });

  it("returns WriteGooderer for scores 96-100", () => {
    expect(getTierForScore(96).name).toBe("WriteGooderer");
    expect(getTierForScore(100).name).toBe("WriteGooderer");
  });

  it("returns appropriate colors for each tier", () => {
    expect(getTierForScore(10).color).toBe("#FF6B6B");
    expect(getTierForScore(30).color).toBe("#FFA07A");
    expect(getTierForScore(50).color).toBe("#FFD93D");
    expect(getTierForScore(70).color).toBe("#4ECDC4");
    expect(getTierForScore(90).color).toBe("#2ECC71");
    expect(getTierForScore(100).color).toBe("#27AE60");
  });

  it("falls back to Caveman for out-of-range scores", () => {
    expect(getTierForScore(-5).name).toBe("Caveman");
    expect(getTierForScore(150).name).toBe("Caveman");
  });
});

describe("SCORE_TIERS", () => {
  it("has 6 tiers", () => {
    expect(SCORE_TIERS).toHaveLength(6);
  });

  it("covers the full 0-100 range without gaps", () => {
    // Check tiers are contiguous
    for (let i = 1; i < SCORE_TIERS.length; i++) {
      expect(SCORE_TIERS[i].min).toBe(SCORE_TIERS[i - 1].max + 1);
    }
    expect(SCORE_TIERS[0].min).toBe(0);
    expect(SCORE_TIERS[SCORE_TIERS.length - 1].max).toBe(100);
  });
});

describe("TONES", () => {
  it("has 8 tone presets", () => {
    expect(Object.keys(TONES)).toHaveLength(8);
  });

  it("each tone has name, description, and subtitle", () => {
    for (const [key, config] of Object.entries(TONES)) {
      expect(config.name, `${key} should have a name`).toBeTruthy();
      expect(config.description, `${key} should have a description`).toBeTruthy();
      expect(config.subtitle, `${key} should have a subtitle`).toBeTruthy();
    }
  });
});

describe("LOADING_QUIPS", () => {
  it("has at least 10 quips", () => {
    expect(LOADING_QUIPS.length).toBeGreaterThanOrEqual(10);
  });

  it("all quips are non-empty strings", () => {
    for (const quip of LOADING_QUIPS) {
      expect(quip.length).toBeGreaterThan(0);
    }
  });
});
