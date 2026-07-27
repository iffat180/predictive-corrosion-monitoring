import { describe, it, expect } from "vitest";
import { calculateSlope, calculateCorrosionRate, daysUntilUnsafe, type Point } from "./regression.js";

describe("calculateSlope", () => {
  it("returns the exact slope for a perfectly linear declining trend", () => {
    const points: Point[] = [
      { x: 0, y: 10.0 },
      { x: 1, y: 9.9 },
      { x: 2, y: 9.8 },
    ];

    expect(calculateSlope(points)).toBeCloseTo(-0.1);
  });

  it("returns a positive slope for an increasing trend", () => {
    const points: Point[] = [
      { x: 0, y: 5 },
      { x: 1, y: 6 },
      { x: 2, y: 7 },
    ];

    expect(calculateSlope(points)).toBeCloseTo(1);
  });

  it("returns zero slope for a perfectly flat trend", () => {
    const points: Point[] = [
      { x: 0, y: 8 },
      { x: 1, y: 8 },
      { x: 2, y: 8 },
    ];

    expect(calculateSlope(points)).toBeCloseTo(0);
  });
});

describe("calculateCorrosionRate", () => {
  it("flips a negative slope into a positive corrosion rate", () => {
    const points: Point[] = [
      { x: 0, y: 10.0 },
      { x: 1, y: 9.9 },
      { x: 2, y: 9.8 },
    ];

    expect(calculateCorrosionRate(points)).toBeCloseTo(0.1);
  });

  it("returns a negative rate when thickness is increasing (not corroding)", () => {
    const points: Point[] = [
      { x: 0, y: 5 },
      { x: 1, y: 6 },
      { x: 2, y: 7 },
    ];

    expect(calculateCorrosionRate(points)).toBeCloseTo(-1);
  });
});

describe("daysUntilUnsafe", () => {
  it("returns null when the rate is exactly zero", () => {
    expect(daysUntilUnsafe(10, 5, 0)).toBeNull();
  });

  it("returns null when the rate is negative", () => {
    expect(daysUntilUnsafe(10, 5, -0.01)).toBeNull();
  });

  it("returns 0 when already at or below the safe threshold", () => {
    expect(daysUntilUnsafe(4, 5, 0.02)).toBe(0);
    expect(daysUntilUnsafe(5, 5, 0.02)).toBe(0);
  });

  it("calculates days remaining correctly for a normal case", () => {
    expect(daysUntilUnsafe(10, 8, 0.05)).toBe(40);
  });
});
