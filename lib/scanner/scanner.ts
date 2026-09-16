import { load } from "cheerio";
import type { ScanResult } from "@/types/scanner";
import { validateAndNormaliseUrl } from "@/lib/security/url";
import { fetchWebsite } from "@/lib/scanner/fetcher";
import { parseHtml } from "@/lib/scanner/parser";
import { buildAssets } from "@/lib/scanner/assets";
import { extractMetadata } from "@/lib/scanner/metadata";
import { extractColors } from "@/lib/scanner/colors";
import { detectTechnologies } from "@/lib/scanner/technologies";

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
  const colors = extractColors($);

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
