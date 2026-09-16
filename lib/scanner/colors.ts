import type { CheerioAPI } from "cheerio";

/**
 * Extract all colour values found in inline styles and <style> blocks,
 * normalised to uppercase hex (#RRGGBB).
 */
export function extractColors(
  $: CheerioAPI | null,
  cssTexts: string[] = [],
): string[] {
  const styleTexts = $ ? [
    ...cssTexts,
    ...$("style")
      .map((_, el) => $(el).text())
      .get(),
  ].join("\n") : cssTexts.join("\n");

  const css = styleTexts;

  const rawColors =
    css.match(
      /#(?:[0-9a-fA-F]{8}(?![0-9a-fA-F])|[0-9a-fA-F]{6}(?![0-9a-fA-F])|[0-9a-fA-F]{4}(?![0-9a-fA-F])|[0-9a-fA-F]{3}(?![0-9a-fA-F]))|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g,
    ) ?? [];

  const unique = new Set<string>();

  for (const raw of rawColors) {
    const hex = normaliseColor(raw.trim());
    if (hex) unique.add(hex);
  }

  return [...unique];
}

function normaliseColor(raw: string): string | null {
  const lower = raw.toLowerCase();

  if (lower.startsWith("#")) {
    return normaliseHex(lower);
  }

  if (lower.startsWith("rgb(") || lower.startsWith("rgba(")) {
    return normaliseRgba(lower);
  }

  if (lower.startsWith("hsl(") || lower.startsWith("hsla(")) {
    return normaliseHsl(lower);
  }

  return null;
}

function normaliseHex(hex: string): string | null {
  const value = hex.slice(1);
  if (value.length === 3) {
    return (
      "#" + value[0] + value[0] + value[1] + value[1] + value[2] + value[2]
    );
  }
  if (value.length === 4) {
    return (
      "#" + value[0] + value[0] + value[1] + value[1] + value[2] + value[2]
    );
  }
  if (value.length === 6) return "#" + value;
  if (value.length === 8) return "#" + value.slice(0, 6);
  return null;
}

function normaliseRgba(raw: string): string | null {
  const match = raw.match(
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)/,
  );
  if (!match) return null;
  const [, r, g, b] = match;
  return toHex(+r, +g, +b);
}

function normaliseHsl(raw: string): string | null {
  const match = raw.match(
    /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+\s*)?\)/,
  );
  if (!match) return null;
  const [, hStr, sStr, lStr] = match;
  return hslToHex(+hStr, +sStr, +lStr);
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return toHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  );
}
