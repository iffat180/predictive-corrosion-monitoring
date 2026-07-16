import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NUM_ASSETS = 40;
const DAYS_OF_HISTORY = 365;
const READING_INTERVAL_DAYS = 6;

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.recommendation.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.asset.deleteMany();

  for (let i = 1; i <= NUM_ASSETS; i++) {
    const startingThickness = randomInRange(8, 12); // mm
    const simulatedCorrosionRate = randomInRange(0.002, 0.03); // mm/day
    const minSafeThickness = startingThickness * randomInRange(0.55, 0.75);

    const asset = await prisma.asset.create({
      data: {
        name: `Tank-${i}`,
        startingThickness,
        simulatedCorrosionRate,
        minSafeThickness,
      },
    });

    const readings = [];
    const now = new Date();

    for (let daysAgo = DAYS_OF_HISTORY; daysAgo >= 0; daysAgo -= READING_INTERVAL_DAYS) {
      const daysElapsedSinceStart = DAYS_OF_HISTORY - daysAgo;
      const expectedThickness =
        startingThickness - simulatedCorrosionRate * daysElapsedSinceStart;

      const wobble = randomInRange(-0.05, 0.05);
      const thickness = Math.max(expectedThickness + wobble, 0);

      const recordedAt = new Date(now);
      recordedAt.setDate(recordedAt.getDate() - daysAgo);

      readings.push({
        assetId: asset.id,
        thickness,
        pressure: randomInRange(80, 150),
        temperature: randomInRange(10, 45),
        recordedAt,
      });
    }

    await prisma.reading.createMany({ data: readings });
    console.log(`Seeded ${asset.name} with ${readings.length} readings`);
  }

  console.log("Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
