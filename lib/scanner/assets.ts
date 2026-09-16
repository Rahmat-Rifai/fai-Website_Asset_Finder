import type { Asset, ScanResult } from "@/types/scanner";
import type { ParsedAsset, ParsedAssets } from "@/lib/scanner/parser";

/**
 * Map raw parsed assets to ScanResult assets:
 * - Resolve relative URLs to absolute
 * - Deduplicate by absolute URL
 * - Assign mimeType where available
 */
export function buildAssets(
  baseUrl: string,
  parsed: ParsedAssets,
): ScanResult["assets"] {
  return {
    images: normalise(baseUrl, parsed.images),
    svg: normalise(baseUrl, parsed.svg),
    stylesheets: normalise(baseUrl, parsed.stylesheets),
    scripts: normalise(baseUrl, parsed.scripts),
    fonts: normalise(baseUrl, parsed.fonts),
    icons: normalise(baseUrl, parsed.icons),
    videos: normalise(baseUrl, parsed.videos),
    audio: normalise(baseUrl, parsed.audio),
  };
}

function toAbsolute(rawUrl: string, baseUrl: string): string {
  try {
    return new URL(rawUrl, baseUrl).href;
  } catch {
    return rawUrl;
  }
}

function normalise(baseUrl: string, raw: ParsedAsset[]): Asset[] {
  const seen = new Map<string, Asset>();

  for (const item of raw) {
    const absUrl = toAbsolute(item.url, baseUrl);
    if (seen.has(absUrl)) continue;

    const asset: Asset = {
      url: absUrl,
      name: item.name,
      type: item.mime ?? guessTypeFromUrl(absUrl),
      mimeType: item.mime,
      width: item.width ?? null,
      height: item.height ?? null,
      size: null,
    };
    seen.set(absUrl, asset);
  }

  return [...seen.values()];
}

function guessTypeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    png: "image",
    jpg: "image",
    jpeg: "image",
    webp: "image",
    gif: "image",
    svg: "image",
    ico: "image",
    avif: "image",
    css: "stylesheet",
    js: "script",
    woff: "font",
    woff2: "font",
    ttf: "font",
    otf: "font",
    mp4: "video",
    webm: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
  };
  return map[ext] ?? "unknown";
}
