import { Router } from "express";
import { prisma } from "../lib/db.js";
import { computeAssetMetrics, type AssetMetrics } from "../lib/assetMetrics.js";
import type { RiskLevel } from "../lib/risk.js";

export const assetsRouter = Router();

// GET /assets?riskLevel=HIGH&sortBy=daysRemaining
assetsRouter.get("/", async (req, res) => {
  const assets = await prisma.asset.findMany({
    include: { readings: { orderBy: { recordedAt: "asc" } } },
  });

  let results = assets.map((asset) => {
    const metrics = computeAssetMetrics(asset.readings, Number(asset.minSafeThickness));
    return { id: asset.id, name: asset.name, ...metrics };
  });

  const riskLevelFilter = req.query.riskLevel as RiskLevel | undefined;
  if (riskLevelFilter) {
    results = results.filter((a) => a.riskLevel === riskLevelFilter);
  }

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
