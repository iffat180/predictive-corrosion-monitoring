import { calculateCorrosionRate, daysUntilUnsafe, type Point } from "../forecasting/regression.js";
import { calculateRiskLevel, type RiskLevel } from "./risk.js";

interface ReadingLike {
  thickness: unknown; // Prisma Decimal
  recordedAt: Date;
}

export interface AssetMetrics {
  corrosionRate: number | null;
  daysRemaining: number | null;
  riskLevel: RiskLevel;
  latestThickness: number | null;
}

/**
 * Computes derived metrics for one asset from its ordered reading history.
 * Readings must already be sorted oldest -> newest.
 */
export function computeAssetMetrics(
  readings: ReadingLike[],
  minSafeThickness: number,
): AssetMetrics {
  if (readings.length < 2) {
    return { corrosionRate: null, daysRemaining: null, riskLevel: "LOW", latestThickness: null };
  }

  const firstDate = readings[0].recordedAt.getTime();
  const points: Point[] = readings.map((r) => ({
    x: (r.recordedAt.getTime() - firstDate) / (1000 * 60 * 60 * 24),
    y: Number(r.thickness),
  }));

  const corrosionRate = calculateCorrosionRate(points);
  const latestThickness = Number(readings[readings.length - 1].thickness);
  const daysRemaining = daysUntilUnsafe(latestThickness, minSafeThickness, corrosionRate);
  const riskLevel = calculateRiskLevel(daysRemaining);

  return { corrosionRate, daysRemaining, riskLevel, latestThickness };
}
