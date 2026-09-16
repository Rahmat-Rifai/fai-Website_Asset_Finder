import type { ScanResult } from "@/types/scanner";

export function toTxt(result: ScanResult): string {
  const lines: string[] = [];
  lines.push("AssetLens Scan Report");
  lines.push("========================");
  lines.push(`URL: ${result.url}`);
  lines.push(`Final URL: ${result.finalUrl}`);
  lines.push(`Title: ${result.title ?? "(none)"}`);
  lines.push(`Scanned At: ${result.scannedAt}`);
  lines.push("");

  const counts: Array<[keyof ScanResult["assets"], string]> = [
    ["images", "Images"],
    ["svg", "SVG"],
    ["stylesheets", "Stylesheets"],
    ["scripts", "Scripts"],
    ["fonts", "Fonts"],
    ["icons", "Icons"],
    ["videos", "Videos"],
    ["audio", "Audio"],
  ];

  lines.push("Assets");
  lines.push("------");
  for (const [key, label] of counts) {
    lines.push(`${label}: ${result.assets[key].length}`);
  }

  if (result.assets.images.length) {
    lines.push("");
    lines.push("Images");
    lines.push("------");
    for (const img of result.assets.images) {
      lines.push(`- ${img.name} (${img.url})`);
    }
  }

  lines.push("");
  lines.push("Technologies");
  lines.push("------------");
  for (const tech of result.technologies) {
    lines.push(`- ${tech.name} [${tech.category}] (${tech.confidence})`);
  }

  lines.push("");
  lines.push("Colors");
  lines.push("------");
  lines.push(result.colors.join(" "));

  return lines.join("\n");
}
