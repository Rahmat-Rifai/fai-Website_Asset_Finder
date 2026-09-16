import { NextResponse } from "next/server";
import { validateAndNormaliseUrl } from "@/lib/security/url";
import { validateUrlSsrf } from "@/lib/security/ssrf";
import {
  checkScanRateLimit,
  clientIpFromRequest,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA = "AssetLensBot/1.0";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const TIMEOUT_MS = 15000;

export async function GET(request: Request): Promise<Response> {
  const ip = clientIpFromRequest(request);
  // Re-use scan rate limit key with a prefix to give a separate bucket
  const limit = await checkScanRateLimit(`dl:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = validateAndNormaliseUrl(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    let res: Response;
    let currentUrl = targetUrl;

    for (let hop = 0; hop <= 3; hop++) {
      await validateUrlSsrf(currentUrl);

      res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": UA },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) throw new Error("Redirect without location");
        currentUrl = new URL(location, currentUrl);
        if (!["http:", "https:"].includes(currentUrl.protocol)) {
          throw new Error("Invalid protocol redirect");
        }
        continue;
      }
      
      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
        throw new Error("File too large");
      }

      // Enforce the cap even when the origin omits Content-Length.
      const body = await res.arrayBuffer();
      if (body.byteLength > MAX_BYTES) {
        throw new Error("File too large");
      }

      // Safe to return
      const headers = new Headers();
      const ct = res.headers.get("content-type");
      if (ct) headers.set("Content-Type", ct);
      
      // Determine filename
      const filename = currentUrl.pathname.split("/").pop() || "download";
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      
      return new NextResponse(body, { headers });
    }

    throw new Error("Too many redirects");
  } catch (err: unknown) {
    console.error("Asset download error:", err);
    return NextResponse.json(
      { error: "Failed to download asset" },
      { status: 502 }
    );
  }
}