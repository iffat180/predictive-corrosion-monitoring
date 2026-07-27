import { describe, it, expect } from "vitest";
import { computeAssetMetrics } from "./assetMetrics.js";

describe("computeAssetMetrics", () => {
  it("returns nulls and LOW risk for 0 readings", () => {
    const result = computeAssetMetrics([], 5);

    expect(result).toEqual({
      corrosionRate: null,
      daysRemaining: null,
      riskLevel: "LOW",
      latestThickness: null,
    });
  });

  it("returns the known thickness but no trend for exactly 1 reading", () => {
    const result = computeAssetMetrics(
      [{ thickness: 9.9, recordedAt: new Date("2024-01-01") }],
      5,
    );

    expect(result).toEqual({
      corrosionRate: null,
      daysRemaining: null,
      riskLevel: "LOW",
      latestThickness: 9.9,
    });
  });

  it("computes real metrics for exactly 2 readings", () => {
    const readings = [
      { thickness: 10.0, recordedAt: new Date("2024-01-01") },
      { thickness: 9.9, recordedAt: new Date("2024-01-02") },
    ];

    const result = computeAssetMetrics(readings, 5);

    expect(result.corrosionRate).toBeCloseTo(0.1);
    expect(result.latestThickness).toBeCloseTo(9.9);
    expect(result.daysRemaining).toBeCloseTo(49);
    expect(result.riskLevel).toBe("HIGH");
  });
});
