import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

describe("GET /assets", () => {
  it("returns an array of assets with the expected shape", async () => {
    const res = await request(app).get("/assets");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const asset = res.body[0];
    expect(asset).toHaveProperty("id");
    expect(asset).toHaveProperty("name");
    expect(asset).toHaveProperty("corrosionRate");
    expect(asset).toHaveProperty("daysRemaining");
    expect(asset).toHaveProperty("latestThickness");
    expect(RISK_LEVELS).toContain(asset.riskLevel);
  });

  it("only returns assets matching riskLevel when the filter is applied", async () => {
    const res = await request(app).get("/assets?riskLevel=HIGH");

    expect(res.status).toBe(200);
    for (const asset of res.body) {
      expect(asset.riskLevel).toBe("HIGH");
    }
  });
});

describe("GET /assets/:id", () => {
  it("returns full detail for a real asset id", async () => {
    const list = await request(app).get("/assets");
    const realId = list.body[0].id;

    const res = await request(app).get(`/assets/${realId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(realId);
    expect(res.body).toHaveProperty("minSafeThickness");
    expect(RISK_LEVELS).toContain(res.body.riskLevel);
  });

  it("returns 404 for an id that doesn't exist", async () => {
    const res = await request(app).get("/assets/999999999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /assets/:id/readings", () => {
  it("returns that asset's readings ordered oldest to newest", async () => {
    const list = await request(app).get("/assets");
    const realId = list.body[0].id;

    const res = await request(app).get(`/assets/${realId}/readings`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    for (let i = 1; i < res.body.length; i++) {
      const prevTime = new Date(res.body[i - 1].recordedAt).getTime();
      const currTime = new Date(res.body[i].recordedAt).getTime();
      expect(currTime).toBeGreaterThanOrEqual(prevTime);
    }
  });
});

describe("GET /assets/:id/recommendations", () => {
  it("returns an array for a real asset id", async () => {
    const list = await request(app).get("/assets");
    const realId = list.body[0].id;

    const res = await request(app).get(`/assets/${realId}/recommendations`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
