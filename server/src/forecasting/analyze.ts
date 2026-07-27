import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { calculateCorrosionRate, daysUntilUnsafe, type Point } from "./regression.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const assets = await prisma.asset.findMany({
    include: { readings: { orderBy: { recordedAt: "asc" } } },
  });

  for (const asset of assets) {
    const readings = asset.readings;
    if (readings.length < 2) continue;

    const firstDate = readings[0].recordedAt.getTime();
    const points: Point[] = readings.map((r) => ({
      x: (r.recordedAt.getTime() - firstDate) / (1000 * 60 * 60 * 24),
      y: Number(r.thickness),
    }));

    const calculatedRate = calculateCorrosionRate(points);
    const simulatedRate = Number(asset.simulatedCorrosionRate);

    const latestThickness = Number(readings[readings.length - 1].thickness);
    const minSafe = Number(asset.minSafeThickness);
    const daysRemaining = daysUntilUnsafe(latestThickness, minSafe, calculatedRate);

    console.log(
      `${asset.name.padEnd(8)} simulated=${simulatedRate.toFixed(4)}  calculated=${calculatedRate.toFixed(4)}  diff=${Math.abs(simulatedRate - calculatedRate).toFixed(4)}  daysRemaining=${daysRemaining === null ? "N/A" : Math.round(daysRemaining)}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
