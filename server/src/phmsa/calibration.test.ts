import { describe, it, expect } from "vitest";
import { computeCalibration } from "./calibration.js";

describe("computeCalibration", () => {
  it("returns real-world and simulated medians with a verdict", async () => {
    const result = await computeCalibration();

    expect(result.realWorldSampleSize).toBeGreaterThan(0);
    expect(result.simulatedSampleSize).toBeGreaterThan(0);
    expect(result.realWorldMedianYears).toBeGreaterThan(0);
    expect(result.simulatedMedianYears).toBeGreaterThan(0);
    expect(["TOO_AGGRESSIVE", "REALISTIC", "TOO_CONSERVATIVE"]).toContain(result.verdict);
  });

  it("flags our fleet as too aggressive relative to real PHMSA corrosion data", async () => {
    // Our simulator generates fast-moving demo data on purpose (readable
    // dashboards over a short seed window), so it should read as far faster
    // than the real ~decades-long timeline PHMSA data shows.
    const result = await computeCalibration();

    expect(result.simulatedMedianYears).toBeLessThan(result.realWorldMedianYears);
    expect(result.verdict).toBe("TOO_AGGRESSIVE");
  });
});
