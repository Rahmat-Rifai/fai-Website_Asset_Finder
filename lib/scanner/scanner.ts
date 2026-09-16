import { load } from "cheerio";
import type { ScanResult } from "@/types/scanner";
import { validateAndNormaliseUrl } from "@/lib/security/url";
import { fetchWebsite, fetchImageBuffer } from "@/lib/scanner/fetcher";
import { parseHtml } from "@/lib/scanner/parser";
import { buildAssets } from "@/lib/scanner/assets";
import { extractMetadata } from "@/lib/scanner/metadata";
import { extractColors } from "@/lib/scanner/colors";
import { detectTechnologies } from "@/lib/scanner/technologies";
import { analyzeExternalCss } from "@/lib/scanner/css";
import { detectImageDimensions, isImageAsset } from "@/lib/scanner/dimensions";

export interface ScanOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
}

/**
 * Full scan pipeline: validate -> SSRF-safe fetch -> parse -> analyse.
 * Stateless; nothing is persisted (ADR-002).
 */
export async function scanWebsite(
  rawUrl: string,
  opts?: ScanOptions,
): Promise<ScanResult> {
  const normalised = validateAndNormaliseUrl(rawUrl);
  const { html, finalUrl } = await fetchWebsite(normalised.href, opts);

  const $ = load(html);
  const parsed = parseHtml(html);
  const assets = buildAssets(finalUrl, parsed);
  const metadata = extractMetadata($);

  const scriptSrcs = parsed.scripts.map((s) => s.url);
  const cssHrefs = parsed.stylesheets.map((s) => s.url);
  const technologies = detectTechnologies($, scriptSrcs, cssHrefs);
  let colors = extractColors($);

  // Analyze external CSS for fonts, background images, and colors
  const cssAssets = await analyzeExternalCss(finalUrl, cssHrefs);
  colors.push(...cssAssets.colors);
  colors = [...new Set(colors)]; // deduplicate

  // Merge CSS assets into the main assets
  const mergedFonts = [...assets.fonts, ...cssAssets.fonts];
  const mergedImages = [...assets.images, ...cssAssets.images];

  assets.fonts = mergedFonts;
  assets.images = mergedImages;

  // Optionally detect image dimensions for a limited number of images
  // to avoid excessive requests.
  const MAX_IMG_DIMS = 5;
  const imgSamples = [...assets.images].slice(0, MAX_IMG_DIMS);
  for (const img of imgSamples) {
    if (isImageAsset(img)) {
      const buffer = await fetchImageBuffer(img.url, {
        timeoutMs: 8000,
        maxBytes: 1 * 1024 * 1024, // 1 MB
        maxRedirects: 3,
      });
      if (buffer) {
        const updated = detectImageDimensions(img, buffer);
        const index = assets.images.findIndex((a) => a.url === img.url);
        if (index >= 0) assets.images[index] = updated;
      }
    }
  }

  return {
    url: normalised.href,
    finalUrl,
    title: metadata.title,
    metadata,
    assets,
    colors,
    technologies,
    scannedAt: new Date().toISOString(),
  };
}
