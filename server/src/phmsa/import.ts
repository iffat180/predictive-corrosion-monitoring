import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../lib/db.js";
import type { CauseCategory } from "../generated/prisma/enums.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, "..", "..", "data", "phmsa-hazardous-liquid-incidents.csv");

interface IncidentRow {
  reportNumber: string;
  incidentYear: number;
  cause: CauseCategory;
  installationYear: number | null;
  material: string | null;
}

function parseCsv(text: string): IncidentRow[] {
  const lines = text.trim().split("\n");
  const rows: IncidentRow[] = [];

  for (const line of lines.slice(1)) {
    const [reportNumber, incidentYear, cause, installationYear, material] = line.split(",");
    rows.push({
      reportNumber,
      incidentYear: Number(incidentYear),
      cause: cause as CauseCategory,
      installationYear: installationYear ? Number(installationYear) : null,
      material: material || null,
    });
  }

  return rows;
}

async function main() {
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(text);

  await prisma.phmsaIncident.deleteMany();
  await prisma.phmsaIncident.createMany({ data: rows });

  console.log(`Imported ${rows.length} PHMSA incidents.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
