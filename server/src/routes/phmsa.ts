import { Router } from "express";
import { computeCalibration } from "../phmsa/calibration.js";
import { getOrSetCache } from "../lib/cache.js";

export const phmsaRouter = Router();

const CALIBRATION_CACHE_KEY = "phmsa:calibration";
const CALIBRATION_CACHE_TTL_SECONDS = 300;

// GET /phmsa/calibration
phmsaRouter.get("/calibration", async (_req, res) => {
  const result = await getOrSetCache(CALIBRATION_CACHE_KEY, CALIBRATION_CACHE_TTL_SECONDS, () =>
    computeCalibration(),
  );

  res.json(result);
});
