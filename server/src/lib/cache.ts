import "dotenv/config";
import { Redis } from "ioredis";

let client: Redis | undefined;

function getClient(): Redis {
  client ??= new Redis(process.env.REDIS_URL!);
  return client;
}

/**
 * Cache-aside helper: read from Redis, compute and write through on a miss.
 * Redis failures never block the request — they just fall back to compute().
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await getClient().get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (err) {
    console.error(`Redis read failed for key "${key}", falling back to direct computation`, err);
  }

  const fresh = await compute();

  try {
    await getClient().set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch (err) {
    console.error(`Redis write failed for key "${key}"`, err);
  }

  return fresh;
}
