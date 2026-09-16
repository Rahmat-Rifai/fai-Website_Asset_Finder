import { ScanError } from "@/lib/scanner/errors";
import { validateAndNormaliseUrl } from "@/lib/security/url";
import { validateUrlSsrf } from "@/lib/security/ssrf";

export interface FetchResult {
  finalUrl: string;
  html: string;
  status: number;
}

const UA = "AssetLensBot/1.0";
const HTML_TYPES = ["text/html", "application/xhtml+xml"];

export async function fetchWebsite(
  rawUrl: string,
  opts?: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number },
): Promise<FetchResult> {
  const timeout = opts?.timeoutMs ?? 10_000;
  const maxBytes = opts?.maxBytes ?? 5 * 1024 * 1024;
  const maxRedirects = opts?.maxRedirects ?? 5;

  let url = validateAndNormaliseUrl(rawUrl);

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await validateUrlSsrf(url);

    const res = await fetchWithTimeout(url, timeout);

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location)
        throw new ScanError(
          "FETCH_FAILED",
          "Redirect with no location header.",
        );
      try {
        url = new URL(location, url);
      } catch {
        throw new ScanError("FETCH_FAILED", "Invalid redirect location.");
      }
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new ScanError("BLOCKED_URL", "Redirect to non-http protocol.");
      }
      continue;
    }

    // We've reached the final non-redirect response
    const ct = res.headers.get("content-type") ?? "";
    if (!HTML_TYPES.some((t) => ct.includes(t))) {
      throw new ScanError("INVALID_CONTENT_TYPE");
    }

    const html = await readBodyWithCap(res, maxBytes);
    return { finalUrl: url.href, html, status: res.status };
  }

  throw new ScanError("FETCH_FAILED", "Too many redirects.");
}

async function fetchWithTimeout(
  url: URL,
  timeoutMs: number,
): Promise<Response> {
  try {
    return await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": UA,
        accept: "text/html",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ScanError("TIMEOUT");
    }
    throw new ScanError(
      "FETCH_FAILED",
      `Network error: ${(err as Error).message ?? err}`,
    );
  }
}

async function readBodyWithCap(
  res: Response,
  maxBytes: number,
): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new ScanError("FETCH_FAILED", "No response body.");

  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.length;
        if (received > maxBytes) {
          throw new ScanError("RESPONSE_TOO_LARGE");
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}
