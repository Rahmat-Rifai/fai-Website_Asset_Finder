import { NextResponse } from "next/server";
import { scanWebsite } from "@/lib/scanner/scanner";
import { toScanError, type ScanErrorCodeType } from "@/lib/scanner/errors";
import {
  checkScanRateLimit,
  clientIpFromRequest,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_BY_CODE: Partial<Record<ScanErrorCodeType, number>> = {
  INVALID_URL: 400,
  BLOCKED_URL: 403,
  SSRF_BLOCKED: 403,
  FETCH_FAILED: 502,
  TIMEOUT: 504,
  RESPONSE_TOO_LARGE: 413,
  INVALID_CONTENT_TYPE: 415,
  PARSING_FAILED: 422,
  UNKNOWN_ERROR: 500,
};

export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  const limit = await checkScanRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Try again later.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let url: string | undefined;
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url === "string") url = body.url;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_URL", message: "Invalid request body." },
      },
      { status: 400 },
    );
  }

  if (!url || url.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_URL", message: "A URL is required." },
      },
      { status: 400 },
    );
  }

  try {
    const data = await scanWebsite(url);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const scanError = toScanError(err);
    const status = STATUS_BY_CODE[scanError.code] ?? 500;
    return NextResponse.json(
      {
        success: false,
        error: { code: scanError.code, message: scanError.message },
      },
      { status },
    );
  }
}
