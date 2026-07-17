const API_BASE = "http://localhost:3001";

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
