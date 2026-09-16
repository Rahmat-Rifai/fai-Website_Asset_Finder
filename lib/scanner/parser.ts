import { load } from "cheerio";
import type { Element } from "domhandler";
import { ScanError } from "@/lib/scanner/errors";

export interface ParsedAsset {
  url: string;
  name: string;
  mime?: string;
  width?: number | null;
  height?: number | null;
}

export interface ParsedAssets {
  images: ParsedAsset[];
  svg: ParsedAsset[];
  stylesheets: ParsedAsset[];
  scripts: ParsedAsset[];
  fonts: ParsedAsset[];
  icons: ParsedAsset[];
  videos: ParsedAsset[];
  audio: ParsedAsset[];
}

const FONT_MIME: Record<string, string> = {
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
};

export function getMimeFromUrl(url: string): string | undefined {
  const ext = url.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    avif: "image/avif",
  };
  return ext ? map[ext] : undefined;
}

function toInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

export function parseHtml(html: string): ParsedAssets {
  if (!html || html.trim().length === 0) {
    throw new ScanError("PARSING_FAILED", "Empty HTML document.");
  }

  const $ = load(html);
  const assets: ParsedAssets = {
    images: [],
    svg: [],
    stylesheets: [],
    scripts: [],
    fonts: [],
    icons: [],
    videos: [],
    audio: [],
  };

  // Extract URLs from srcset (shared by <img> and <picture><source>)
  function parseSrcset(srcset: string): string[] {
    return srcset
      .split(",")
      .map((s) => s.trim().split(/\s+/)[0])
      .filter(Boolean);
  }

  // <img> tags (also catches <img> inside <picture>)
  $("img[src], img[srcset]").each((_: number, el: Element) => {
    const node = $(el);
    const src = node.attr("src") ?? "";
    const srcset = node.attr("srcset") ?? "";
    const urls = src ? [src] : parseSrcset(srcset);
    const name = node.attr("alt") ?? "image";

    for (const url of urls) {
      assets.images.push({
        url,
        name,
        mime: getMimeFromUrl(url),
        width: toInt(node.attr("width")),
        height: toInt(node.attr("height")),
      });
    }
  });

  // <picture><source srcset="..."> (not caught by the <img> selector above)
  $("picture > source[srcset]").each((_: number, el: Element) => {
    const srcset = $(el).attr("srcset") ?? "";
    const type = $(el).attr("type") ?? undefined;
    for (const url of parseSrcset(srcset)) {
      assets.images.push({
        url,
        name: "picture-source",
        mime: type ?? getMimeFromUrl(url),
      });
    }
  });

  // og:image (FR-006: meta property="og:image")
  $('meta[property="og:image"]').each((_: number, el: Element) => {
    const url = $(el).attr("content")?.trim() ?? "";
    if (url) {
      assets.images.push({
        url,
        name: "og:image",
        mime: getMimeFromUrl(url),
      });
    }
  });

  // Inline <svg> elements
  $("svg").each((_: number, el: Element) => {
    const width = toInt($(el).attr("width"));
    const height = toInt($(el).attr("height"));
    const id = $(el).attr("id");
    assets.svg.push({
      url: `inline-svg${id ? `#${id}` : ""}`,
      name: id ?? "inline-svg",
      width,
      height,
    });
  });

  $("link[rel='stylesheet']").each((_: number, el: Element) => {
    const url = $(el).attr("href") ?? "";
    if (url)
      assets.stylesheets.push({
        url,
        name: $(el).attr("title") ?? "stylesheet",
      });
  });

  $("script[src]").each((_: number, el: Element) => {
    const url = $(el).attr("src") ?? "";
    if (url)
      assets.scripts.push({ url, name: $(el).attr("title") ?? "script" });
  });

  // Fonts: scan inline <style> @font-face blocks
  const styleText = $("style")
    .map((_: number, el: Element) => $(el).text())
    .get()
    .join("\n");
  const fontRegex =
    /@font-face\s*\{[^}]*?font-family:\s*['"]?([^'";]+)['"]?[^}]*?src:\s*url\(['"]?([^'")]+)['"]?\)/gi;
  let match: RegExpExecArray | null;
  while ((match = fontRegex.exec(styleText)) !== null) {
    const name = match[1].trim();
    const url = match[2].trim();
    const ext = url.split(".").pop()?.toLowerCase();
    assets.fonts.push({ url, name, mime: ext ? FONT_MIME[ext] : undefined });
  }

  $(
    "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']",
  ).each((_: number, el: Element) => {
    const url = $(el).attr("href") ?? "";
    if (url) assets.icons.push({ url, name: $(el).attr("rel") ?? "icon" });
  });

  $("video source, video[src]").each((_: number, el: Element) => {
    const url = $(el).attr("src") ?? $(el).attr("data-src") ?? "";
    if (url) assets.videos.push({ url, name: $(el).attr("title") ?? "video" });
  });

  $("audio source, audio[src]").each((_: number, el: Element) => {
    const url = $(el).attr("src") ?? $(el).attr("data-src") ?? "";
    if (url) assets.audio.push({ url, name: $(el).attr("title") ?? "audio" });
  });

  return assets;
}
