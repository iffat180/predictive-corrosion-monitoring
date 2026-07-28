import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("GET /phmsa/calibration", () => {
  it("returns the calibration comparison", async () => {
    const res = await request(app).get("/phmsa/calibration");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("realWorldMedianYears");
    expect(res.body).toHaveProperty("simulatedMedianYears");
    expect(res.body).toHaveProperty("verdict");
    expect(["TOO_AGGRESSIVE", "REALISTIC", "TOO_CONSERVATIVE"]).toContain(res.body.verdict);
  });
});
