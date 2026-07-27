import { describe, it, expect } from "vitest";
import { RecommendationSchema } from "./recommendation.js";

describe("RecommendationSchema", () => {
  it("accepts a well-formed recommendation", () => {
    const result = RecommendationSchema.safeParse({
      severity: "CRITICAL",
      cause: "INTERNAL_CORROSION",
      recommendedAction: "Schedule immediate inspection.",
      confidence: 0.9,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid severity value", () => {
    const result = RecommendationSchema.safeParse({
      severity: "EXTREME",
      cause: "INTERNAL_CORROSION",
      recommendedAction: "Schedule immediate inspection.",
      confidence: 0.9,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid cause value", () => {
    const result = RecommendationSchema.safeParse({
      severity: "HIGH",
      cause: "RUST",
      recommendedAction: "Schedule immediate inspection.",
      confidence: 0.9,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing recommendedAction", () => {
    const result = RecommendationSchema.safeParse({
      severity: "HIGH",
      cause: "INTERNAL_CORROSION",
      confidence: 0.9,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a confidence value outside 0-1", () => {
    const result = RecommendationSchema.safeParse({
      severity: "HIGH",
      cause: "INTERNAL_CORROSION",
      recommendedAction: "Schedule immediate inspection.",
      confidence: 1.5,
    });

    expect(result.success).toBe(false);
  });
});
