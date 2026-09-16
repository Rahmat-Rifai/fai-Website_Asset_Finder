export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window fallback.
 * Local development and environments without Vercel KV.
 */
export function createRateLimiter(limit = 10, windowMs = 60 * 60 * 1000) {
  const buckets = new Map<string, Bucket>();

  return function check(
    key: string,
    now: number = Date.now(),
  ): RateLimitResult {
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (bucket.count >= limit) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: limit - bucket.count,
      retryAfterSeconds: 0,
    };
  };
}

/** Shared fallback limiter for one serverless process. */
export const scanRateLimiter = createRateLimiter(50, 60 * 60 * 1000);

// Dynamically resolved only when KV env vars are present.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kvLimiter: any | null | undefined;

/**
 * Lazily initialise the Upstash Ratelimit instance using dynamic imports so
 * that the synchronous constructor is only executed inside an async server
 * context (satisfying Next.js server-component lint rules).
 */
async function getKvLimiter(): Promise<typeof kvLimiter> {
  if (kvLimiter !== undefined) return kvLimiter;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    kvLimiter = null;
    return null;
  }

  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);

    kvLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(50, "600 s"),
      prefix: "assetlens:scan",
      analytics: false,
    });
  } catch {
    kvLimiter = null;
  }

  return kvLimiter;
}

/** Reset the cached limiter between tests. Test-only helper. */
export function resetRateLimiterForTests(): void {
  kvLimiter = undefined;
}

/**
 * Check the shared scan rate limit for a client key.
 * 50 scans / hour / IP. Falls back to in-memory only when KV is absent.
 */
export async function checkScanRateLimit(
  key: string,
): Promise<RateLimitResult> {
  const limiter = await getKvLimiter();

  if (!limiter) return scanRateLimiter(key);

  try {
    const result = await limiter.limit(key);
    const reset = "reset" in result ? result.reset : undefined;
    const retryAfterSeconds =
      typeof reset === "number"
        ? Math.max(1, Math.ceil((reset - Date.now()) / 1000))
        : 0;

    return {
      allowed: result.success,
      remaining: result.remaining ?? 0,
      retryAfterSeconds: result.success ? 0 : retryAfterSeconds,
    };
  } catch {
    // Preserve availability if KV is transiently unavailable. The in-memory
    // window is weaker, but still prevents an unbounded scan loop per process.
    return scanRateLimiter(key);
  }
}

/** Extract a client IP best-effort from request headers. */
export function clientIpFromRequest(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
