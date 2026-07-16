export interface Point {
  x: number; // days since first reading
  y: number; // thickness at that time
}

/**
 * Least-squares linear regression slope.
 * Negative slope = thickness decreasing over time.
 */
export function calculateSlope(points: Point[]): number {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumXX - sumX * sumX;

  return numerator / denominator;
}

/**
 * Converts regression slope into a positive mm/day corrosion rate.
 */
export function calculateCorrosionRate(points: Point[]): number {
  return -calculateSlope(points);
}

/**
 * Days until currentThickness reaches minSafeThickness at the given rate.
 * Returns null if the asset isn't corroding (rate <= 0), so there's nothing to forecast.
 */
export function daysUntilUnsafe(
  currentThickness: number,
  minSafeThickness: number,
  corrosionRatePerDay: number,
): number | null {
  if (corrosionRatePerDay <= 0) {
    return null;
  }

  const remaining = currentThickness - minSafeThickness;
  if (remaining <= 0) {
    return 0;
  }

  return remaining / corrosionRatePerDay;
}
