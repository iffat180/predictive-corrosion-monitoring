export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Day cutoffs are provisional and should be recalibrated against
 * real-world pipeline incident data.
 */
export function calculateRiskLevel(daysRemaining: number | null): RiskLevel {
  if (daysRemaining === null) return "LOW";
  if (daysRemaining <= 30) return "CRITICAL";
  if (daysRemaining <= 90) return "HIGH";
  if (daysRemaining <= 365) return "MEDIUM";
  return "LOW";
}
