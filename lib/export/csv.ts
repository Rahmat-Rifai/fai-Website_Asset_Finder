import type { ScanResult } from "@/types/scanner";

const ESCAPE = (value: unknown): string => {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
};

export function toCsv(result: ScanResult): string {
  const rows: string[] = [];
  rows.push(
    ["category", "name", "type", "url", "mimeType", "width", "height"].join(
      ",",
    ),
  );

  const categories: Array<[keyof ScanResult["assets"], string]> = [
    ["images", "images"],
    ["svg", "svg"],
    ["stylesheets", "stylesheets"],
    ["scripts", "scripts"],
    ["fonts", "fonts"],
    ["icons", "icons"],
    ["videos", "videos"],
    ["audio", "audio"],
  ];

  for (const [key, label] of categories) {
    for (const asset of result.assets[key]) {
      rows.push(
        [
          label,
          asset.name,
          asset.type,
          asset.url,
          asset.mimeType ?? "",
          asset.width ?? "",
          asset.height ?? "",
        ]
          .map(ESCAPE)
          .join(","),
      );
    }
  }

  return rows.join("\n");
}
