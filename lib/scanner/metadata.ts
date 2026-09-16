import type { Metadata } from "@/types/scanner";
import type { CheerioAPI } from "cheerio";

/**
 * Extract metadata, Open Graph, and Twitter Card data from parsed HTML.
 */
export function extractMetadata(
  $: CheerioAPI,
  defaultTitle?: string | null,
): Metadata {
  return {
    title: defaultTitle ?? ($("title").first().text().trim() || null),

    description: $('meta[name="description"]').attr("content")?.trim() || null,
    canonical: $('link[rel="canonical"]').attr("href")?.trim() || null,
    openGraph: extractPropertyMap($, "og"),
    twitter: extractNameMap($, "twitter"),
  };
}

function extractPropertyMap(
  $: CheerioAPI,
  prefix: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  $(`meta[property^="${prefix}"]`).each((_, el) => {
    const property = $(el).attr("property")?.trim() ?? "";
    const content = $(el).attr("content")?.trim() ?? "";
    if (property && content) map[property] = content;
  });
  return map;
}

function extractNameMap($: CheerioAPI, prefix: string): Record<string, string> {
  const map: Record<string, string> = {};
  $(`meta[name^="${prefix}"]`).each((_, el) => {
    const name = $(el).attr("name")?.trim() ?? "";
    const content = $(el).attr("content")?.trim() ?? "";
    if (name && content) map[name] = content;
  });
  return map;
}
