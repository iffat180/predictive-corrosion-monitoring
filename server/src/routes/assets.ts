import { Router } from "express";
import { prisma } from "../lib/db.js";
import { computeAssetMetrics, type AssetMetrics } from "../lib/assetMetrics.js";
import type { RiskLevel } from "../lib/risk.js";
import { generateRecommendation } from "../ai/recommendation.js";
import { getOrSetCache } from "../lib/cache.js";

export const assetsRouter = Router();

type AssetSummary = { id: number; name: string } & AssetMetrics;

const FLEET_METRICS_CACHE_KEY = "fleet:asset-metrics";
const FLEET_METRICS_CACHE_TTL_SECONDS = 60;

// GET /assets?riskLevel=HIGH&sortBy=daysRemaining
assetsRouter.get("/", async (req, res) => {
  const baseResults = await getOrSetCache<AssetSummary[]>(
    FLEET_METRICS_CACHE_KEY,
    FLEET_METRICS_CACHE_TTL_SECONDS,
    async () => {
      const assets = await prisma.asset.findMany({
        include: { readings: { orderBy: { recordedAt: "asc" } } },
      });

      return assets.map((asset) => {
        const metrics = computeAssetMetrics(asset.readings, Number(asset.minSafeThickness));
        return { id: asset.id, name: asset.name, ...metrics };
      });
    },
  );

  const riskLevelFilter = req.query.riskLevel as RiskLevel | undefined;
  let results = riskLevelFilter
    ? baseResults.filter((a) => a.riskLevel === riskLevelFilter)
    : [...baseResults];

  const sortBy = req.query.sortBy as keyof AssetMetrics | undefined;
  if (sortBy) {
    results = results.sort((a, b) => {
      const aVal = a[sortBy] ?? Infinity;
      const bVal = b[sortBy] ?? Infinity;
      return Number(aVal) - Number(bVal);
    });
  }

  res.json(results);
});

// GET /assets/:id
assetsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { readings: { orderBy: { recordedAt: "asc" } } },
  });

  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  const metrics = computeAssetMetrics(asset.readings, Number(asset.minSafeThickness));
  res.json({
    id: asset.id,
    name: asset.name,
    minSafeThickness: Number(asset.minSafeThickness),
    ...metrics,
  });
});

// GET /assets/:id/readings
assetsRouter.get("/:id/readings", async (req, res) => {
  const assetId = Number(req.params.id);
  const readings = await prisma.reading.findMany({
    where: { assetId },
    orderBy: { recordedAt: "asc" },
  });
  res.json(readings);
});

// GET /assets/:id/recommendations
assetsRouter.get("/:id/recommendations", async (req, res) => {
  const assetId = Number(req.params.id);
  const recommendations = await prisma.recommendation.findMany({
    where: { assetId },
    orderBy: { createdAt: "desc" },
  });
  res.json(recommendations);
});

// POST /assets/:id/recommendations
assetsRouter.post("/:id/recommendations", async (req, res) => {
  const id = Number(req.params.id);
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { readings: { orderBy: { recordedAt: "asc" } } },
  });

  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  const minSafeThickness = Number(asset.minSafeThickness);
  const metrics = computeAssetMetrics(asset.readings, minSafeThickness);

  if (metrics.riskLevel !== "HIGH" && metrics.riskLevel !== "CRITICAL") {
    res.status(400).json({ error: "Asset is not flagged (risk level must be HIGH or CRITICAL)" });
    return;
  }

  const output = await generateRecommendation({
    name: asset.name,
    latestThickness: metrics.latestThickness,
    minSafeThickness,
    corrosionRate: metrics.corrosionRate,
    daysRemaining: metrics.daysRemaining,
    riskLevel: metrics.riskLevel,
  });

  if (!output) {
    res.status(502).json({ error: "Failed to generate a valid recommendation" });
    return;
  }

  const recommendation = await prisma.recommendation.create({
    data: {
      assetId: id,
      severity: output.severity,
      cause: output.cause,
      recommendedAction: output.recommendedAction,
      confidence: output.confidence,
    },
  });

  res.status(201).json(recommendation);
});
