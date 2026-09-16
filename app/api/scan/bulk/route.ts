import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner/scanner";
import { toScanError } from "@/lib/scanner/errors";
import { checkScanRateLimit, clientIpFromRequest } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_URLS = 5;
const CONCURRENCY = 3;

export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const urls = Array.isArray((body as { urls?: unknown })?.urls)
    ? ((body as { urls: unknown[] }).urls.filter((u) => typeof u === "string") as string[]).slice(0, MAX_URLS)
    : [];

  if (urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  const results = await runWithConcurrency(
    urls,
    CONCURRENCY,
    async (url: string) => {
      const limit = await checkScanRateLimit(ip);
      if (!limit.allowed) {
        return {
          url,
          success: false,
          error: { code: "RATE_LIMITED", message: "Rate limit exceeded" },
        };
      }
      try {
        const data = await scanWebsite(url);
        return { url, success: true, data };
      } catch (err) {
        const scanError = toScanError(err);
        return {
          url,
          success: false,
          error: { code: scanError.code, message: scanError.message },
        };
      }
    }
  );

  return NextResponse.json({ success: true, results });
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}
