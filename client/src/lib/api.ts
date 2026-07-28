const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AssetSummary {
  id: number;
  name: string;
  corrosionRate: number | null;
  daysRemaining: number | null;
  riskLevel: RiskLevel;
  latestThickness: number | null;
  minSafeThickness?: number;
}

export interface Reading {
  id: number;
  assetId: number;
  thickness: string;
  pressure: string;
  temperature: string;
  recordedAt: string;
}

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CauseCategory =
  | "INTERNAL_CORROSION"
  | "EXTERNAL_CORROSION"
  | "MECHANICAL_DAMAGE"
  | "MATERIAL_FAILURE"
  | "OTHER";

export interface Recommendation {
  id: number;
  assetId: number;
  severity: Severity;
  cause: CauseCategory;
  recommendedAction: string;
  confidence: string;
  createdAt: string;
}

export async function fetchAssets(): Promise<AssetSummary[]> {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

export async function fetchAsset(id: number): Promise<AssetSummary> {
  const res = await fetch(`${API_BASE}/assets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch asset");
  return res.json();
}

export async function fetchReadings(id: number): Promise<Reading[]> {
  const res = await fetch(`${API_BASE}/assets/${id}/readings`);
  if (!res.ok) throw new Error("Failed to fetch readings");
  return res.json();
}

export async function fetchRecommendations(id: number): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/assets/${id}/recommendations`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function generateRecommendation(id: number): Promise<Recommendation> {
  const res = await fetch(`${API_BASE}/assets/${id}/recommendations`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to generate recommendation");
  }
  return res.json();
}

export type CalibrationVerdict = "TOO_AGGRESSIVE" | "REALISTIC" | "TOO_CONSERVATIVE";

export interface Calibration {
  realWorldMedianYears: number;
  realWorldSampleSize: number;
  simulatedMedianYears: number;
  simulatedSampleSize: number;
  verdict: CalibrationVerdict;
}

export async function fetchCalibration(): Promise<Calibration> {
  const res = await fetch(`${API_BASE}/phmsa/calibration`);
  if (!res.ok) throw new Error("Failed to fetch calibration data");
  return res.json();
}
