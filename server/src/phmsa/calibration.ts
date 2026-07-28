import { prisma } from "../lib/db.js";

export type CalibrationVerdict = "TOO_AGGRESSIVE" | "REALISTIC" | "TOO_CONSERVATIVE";

export interface CalibrationResult {
  realWorldMedianYears: number;
  realWorldSampleSize: number;
  simulatedMedianYears: number;
  simulatedSampleSize: number;
  verdict: CalibrationVerdict;
}

function median(sorted: number[]): number {
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Real-world reference point: median pipe age at the time of a corrosion
 * failure, from PHMSA's hazardous liquid incident data. Ages outside
 * 0-120 years are dropped as data-entry errors.
 */
async function computeRealWorldMedianAge(): Promise<{ median: number; sampleSize: number }> {
  const incidents = await prisma.phmsaIncident.findMany({
    where: {
      cause: { in: ["INTERNAL_CORROSION", "EXTERNAL_CORROSION"] },
      installationYear: { not: null },
    },
  });

  const ages = incidents
    .map((i) => i.incidentYear - i.installationYear!)
    .filter((age) => age >= 0 && age <= 120)
    .sort((a, b) => a - b);

  return { median: median(ages), sampleSize: ages.length };
}

/**
 * Simulated reference point: for each asset, how many years its own
 * starting thickness and simulated corrosion rate imply it would take to
 * reach minSafeThickness.
 */
async function computeSimulatedMedianYears(): Promise<{ median: number; sampleSize: number }> {
  const assets = await prisma.asset.findMany();

  const years = assets
    .map((a) => {
      const start = Number(a.startingThickness);
      const min = Number(a.minSafeThickness);
      const rate = Number(a.simulatedCorrosionRate);
      return (start - min) / rate / 365.25;
    })
    .filter((y) => Number.isFinite(y) && y > 0)
    .sort((a, b) => a - b);

  return { median: median(years), sampleSize: years.length };
}

function determineVerdict(realWorldYears: number, simulatedYears: number): CalibrationVerdict {
  const ratio = simulatedYears / realWorldYears;
  if (ratio < 0.7) return "TOO_AGGRESSIVE";
  if (ratio > 1.3) return "TOO_CONSERVATIVE";
  return "REALISTIC";
}

export async function computeCalibration(): Promise<CalibrationResult> {
  const [realWorld, simulated] = await Promise.all([
    computeRealWorldMedianAge(),
    computeSimulatedMedianYears(),
  ]);

  return {
    realWorldMedianYears: realWorld.median,
    realWorldSampleSize: realWorld.sampleSize,
    simulatedMedianYears: simulated.median,
    simulatedSampleSize: simulated.sampleSize,
    verdict: determineVerdict(realWorld.median, simulated.median),
  };
}
