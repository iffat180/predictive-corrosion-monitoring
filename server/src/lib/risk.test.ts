import { describe, it, expect } from "vitest";
import { calculateRiskLevel } from "./risk";

describe("calculateRiskLevel", () => {
  it("returns LOW when daysRemaining is null (not corroding)", () => {
    expect(calculateRiskLevel(null)).toBe("LOW");
  });

  it("returns CRITICAL at the 30-day boundary", () => {
    expect(calculateRiskLevel(30)).toBe("CRITICAL");
  });

  it("returns HIGH just past the 30-day boundary", () => {
    expect(calculateRiskLevel(31)).toBe("HIGH");
  });

  it("returns HIGH at the 90-day boundary", () => {
    expect(calculateRiskLevel(90)).toBe("HIGH");
  });

  it("returns MEDIUM just past the 90-day boundary", () => {
    expect(calculateRiskLevel(91)).toBe("MEDIUM");
  });

  it("returns MEDIUM at the 365-day boundary", () => {
    expect(calculateRiskLevel(365)).toBe("MEDIUM");
  });

  it("returns LOW just past the 365-day boundary", () => {
    expect(calculateRiskLevel(366)).toBe("LOW");
  });
});
