import type { Asset } from "@/types/scanner";
import { ScanError } from "@/lib/scanner/errors";
import { validateAndNormaliseUrl } from "@/lib/security/url";
import { validateUrlSsrf } from "@/lib/security/ssrf";
import { extractColors } from "@/lib/scanner/colors";

const UA = "AssetLensBot/1.0";
const CSS_TYPES = ["text/css"];
const MAX_BYTES = 2 * 1024 * 1024; // 2MB per CSS file
const TIMEOUT_MS = 15000;

export interface CssAssets {
  fonts: Asset[];
  images: Asset[];
  colors: string[];
}

/**
 * Fetch a text resource (CSS, JS, etc.) with SSRF protection and limits.
 */
export async function fetchText(
  rawUrl: string,
  allowedTypes: string[],
  opts?: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number },
): Promise<string> {
  const timeout = opts?.timeoutMs ?? TIMEOUT_MS;
  const maxBytes = opts?.maxBytes ?? MAX_BYTES;
  const maxRedirects = opts?.maxRedirects ?? 5;

  let url = validateAndNormaliseUrl(rawUrl);

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await validateUrlSsrf(url);

    const res = await fetchWithTimeout(url, timeout, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": UA,
        accept: allowedTypes.join(","),
      },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new ScanError("FETCH_FAILED", "Redirect without location");
      try {
        url = new URL(location, url);
      } catch {
        throw new ScanError("FETCH_FAILED", "Invalid redirect location");
      }
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new ScanError("BLOCKED_URL", "Redirect to non-http protocol");
      }
      continue;
    }

    const ct = res.headers.get("content-type") ?? "";
    if (!allowedTypes.some((t) => ct.includes(t))) {
      throw new ScanError("INVALID_CONTENT_TYPE");
    }

    const html = await readBodyWithCap(res, maxBytes);
    return html;
  }

  throw new ScanError("FETCH_FAILED", "Too many redirects");
}

async function fetchWithTimeout(
  url: URL,
  timeoutMs: number,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
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

/**
 * Parse CSS text to extract fonts, background-image URLs, and colors.
 */
export function parseCssAssets(
  cssText: string,
  baseUrl: string,
): CssAssets {
  const fonts: Asset[] = [];
  const images: Asset[] = [];
  const colors: string[] = [];

  // Extract colors
  const extractedColors = extractColors(null, [cssText]);
  colors.push(...extractedColors);

  // @font-face rules
  const fontFaceRegex =
    /@font-face\s*\{[^}]*?font-family:\s*['"]?([^'";]+)['"]?[^}]*?src:\s*url\(['"]?([^'")]+)['"]?\)/gi;
  let match: RegExpExecArray | null;
  while ((match = fontFaceRegex.exec(cssText)) !== null) {
    const name = match[1].trim();
    let url = match[2].trim();
    // resolve relative URL
    try {
      url = new URL(url, baseUrl).href;
    } catch {
      // if invalid, keep as is (will be filtered later)
    }
    const ext = url.split(".").pop()?.toLowerCase() ?? "";
    const fontMimeMap: Record<string, string> = {
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      otf: "font/otf",
    };
    const mime = fontMimeMap[ext] ?? "font/unknown";
    fonts.push({
      url,
      name,
      type: "font",
      mimeType: mime,
      width: null,
      height: null,
      size: null,
    });
  }

  // background-image: url(...)
  const bgRegex = /background-image\s*:\s*url\(['"]?([^'")]+)['"]?\)/gi;
  let bgMatch: RegExpExecArray | null;
  while ((bgMatch = bgRegex.exec(cssText)) !== null) {
    let url = bgMatch[1].trim();
    try {
      url = new URL(url, baseUrl).href;
    } catch {
      // keep as is
    }
    const ext = url.split(".").pop()?.toLowerCase() ?? "";
    const mimeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      svg: "image/svg+xml",
      avif: "image/avif",
      ico: "image/x-icon",
    };
    const mime = mimeMap[ext] ?? "unknown";
    images.push({
      url,
      name: "background-image",
      type: "image",
      mimeType: mime,
      width: null,
      height: null,
      size: null,
    });
  }

  // deduplicate by URL for fonts and images
  const dedupeFonts = Array.from(
    new Map(fonts.map((f) => [f.url, f])).values()
  );
  const dedupeImages = Array.from(
    new Map(images.map((i) => [i.url, i])).values()
  );

  return {
    fonts: dedupeFonts,
    images: dedupeImages,
    colors: [...new Set(colors)],
  };
}

/**
 * Analyze external CSS files: fetch, parse, and return assets.
 */
export async function analyzeExternalCss(
  baseUrl: string,
  cssHrefs: string[],
): Promise<CssAssets> {
  const allFonts: Asset[] = [];
  const allImages: Asset[] = [];
  const allColors: string[] = [];

  // Limit concurrent fetches to avoid too many requests
  const CONCURRENCY = 3;
  const results: CssAssets[] = new Array(cssHrefs.length);
  let idx = 0;

  async function worker() {
    while (idx < cssHrefs.length) {
      const current = idx++;
      try {
        const rawUrl = cssHrefs[current];
        if (!rawUrl) {
          results[current] = { fonts: [], images: [], colors: [] };
          continue;
        }
        const cssText = await fetchText(rawUrl, CSS_TYPES, {
          timeoutMs: 10000,
          maxBytes: 2 * 1024 * 1024,
          maxRedirects: 5,
        });
        const parsed = parseCssAssets(cssText, baseUrl);
        results[current] = parsed;
      } catch {
        // If a CSS fails to fetch or parse, skip it but continue
        results[current] = { fonts: [], images: [], colors: [] };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, cssHrefs.length) }, worker)
  );

  for (const result of results) {
    allFonts.push(...result.fonts);
    allImages.push(...result.images);
    allColors.push(...result.colors);
  }

  // deduplicate again
  const uniqueFonts = Array.from(
    new Map(allFonts.map((f) => [f.url, f])).values()
  );
  const uniqueImages = Array.from(
    new Map(allImages.map((i) => [i.url, i])).values()
  );
  const uniqueColors = [...new Set(allColors)];

  return {
    fonts: uniqueFonts,
    images: uniqueImages,
    colors: uniqueColors,
  };
}