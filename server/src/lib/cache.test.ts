import { describe, it, expect, vi } from "vitest";
import { getOrSetCache } from "./cache.js";

function uniqueKey(): string {
  return `test:cache:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

describe("getOrSetCache", () => {
  it("computes and returns a fresh value on a cache miss", async () => {
    const compute = vi.fn().mockResolvedValue({ value: 42 });

    const result = await getOrSetCache(uniqueKey(), 30, compute);

    expect(result).toEqual({ value: 42 });
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("returns the cached value on a second call without recomputing", async () => {
    const key = uniqueKey();
    const compute = vi.fn().mockResolvedValue({ value: 7 });

    const first = await getOrSetCache(key, 30, compute);
    const second = await getOrSetCache(key, 30, compute);

    expect(first).toEqual({ value: 7 });
    expect(second).toEqual({ value: 7 });
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("computes independently for different keys", async () => {
    const computeA = vi.fn().mockResolvedValue("a");
    const computeB = vi.fn().mockResolvedValue("b");

    const resultA = await getOrSetCache(uniqueKey(), 30, computeA);
    const resultB = await getOrSetCache(uniqueKey(), 30, computeB);

    expect(resultA).toBe("a");
    expect(resultB).toBe("b");
    expect(computeA).toHaveBeenCalledTimes(1);
    expect(computeB).toHaveBeenCalledTimes(1);
  });
});
