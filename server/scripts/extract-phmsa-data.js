/**
 * One-time extraction script. PHMSA's site blocks automated fetching (Akamai
 * bot protection returns 403 even with browser headers), so this data was
 * downloaded manually from:
 * https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/data_statistics/pipeline/PHMSA_Pipeline_Safety_Flagged_Incidents.zip
 *
 * This script reads the extracted "hl2010toPresent.xlsx" (Hazardous Liquid
 * incidents, 2010-present) and writes a trimmed CSV with only the columns
 * this project needs, mapping PHMSA's 8-cause classification onto our own
 * CauseCategory enum.
 *
 * Usage: node scripts/extract-phmsa-data.js <path-to-hl2010toPresent.xlsx>
 */
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Usage: node scripts/extract-phmsa-data.js <path-to-hl2010toPresent.xlsx>");
  process.exit(1);
}

function mapCause(mapEightCause, mapEightSubcause) {
  if (mapEightCause === "CORROSION") {
    if (mapEightSubcause === "EXTERNAL") return "EXTERNAL_CORROSION";
    if (mapEightSubcause === "INTERNAL") return "INTERNAL_CORROSION";
    return "EXTERNAL_CORROSION"; // "OTHER CORROSION" subcause, no side specified
  }
  if (mapEightCause === "MATERIAL FAILURE OF PIPE OR WELD") return "MATERIAL_FAILURE";
  if (mapEightCause === "EQUIPMENT FAILURE" || mapEightCause === "EXCAVATION DAMAGE") {
    return "MECHANICAL_DAMAGE";
  }
  return "OTHER";
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

const wb = xlsx.readFile(sourcePath);
const sheet = wb.Sheets["hl2010toPresent"];
const rows = xlsx.utils.sheet_to_json(sheet);

const header = ["reportNumber", "incidentYear", "cause", "installationYear", "material"];
const lines = [header.join(",")];

for (const row of rows) {
  const reportNumber = row.REPORT_NUMBER;
  const incidentYear = row.IYEAR;
  if (!reportNumber || !incidentYear) continue;

  const cause = mapCause(row.MAP_EIGHT_CAUSE, row.MAP_EIGHT_SUBCAUSE);
  const installationYear = row.INSTALLATION_YEAR ?? "";
  const material = row.MATERIAL_INVOLVED ?? "";

  lines.push(
    [reportNumber, incidentYear, cause, installationYear, material].map(csvEscape).join(","),
  );
}

const outPath = path.join(__dirname, "..", "data", "phmsa-hazardous-liquid-incidents.csv");
fs.writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`Wrote ${lines.length - 1} rows to ${outPath}`);
