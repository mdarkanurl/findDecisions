import { redis } from '../redis';

const DEFAULT_CACHE_TTL_SECONDS = 60;

export function getCacheTTLSeconds(): number {
  const raw = process.env.REDIS_CACHE_TTL_SECONDS;
  if (!raw) {
    return DEFAULT_CACHE_TTL_SECONDS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_CACHE_TTL_SECONDS;
  }

  return Math.floor(parsed);
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson<T>(
  key: string,
  value: T,
  ttlSeconds = getCacheTTLSeconds(),
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Cache failures should not break API responses.
  }
}

export async function deleteCacheByPrefix(prefix: string): Promise<void> {
  try {
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        100,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    // Cache invalidation failures should not block writes.
  }
}
