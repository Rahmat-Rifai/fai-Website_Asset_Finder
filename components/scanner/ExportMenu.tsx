"use client";

import { useState } from "react";
import type { ScanResult } from "@/types/scanner";
import { toJson } from "@/lib/export/json";
import { toCsv } from "@/lib/export/csv";
import { toTxt } from "@/lib/export/txt";

const FORMATS: Array<{
  key: "json" | "csv" | "txt";
  label: string;
  mime: string;
  ext: string;
}> = [
  { key: "json", label: "JSON", mime: "application/json", ext: "json" },
  { key: "csv", label: "CSV", mime: "text/csv", ext: "csv" },
  { key: "txt", label: "TXT", mime: "text/plain", ext: "txt" },
];

function generate(format: "json" | "csv" | "txt", result: ScanResult): string {
  switch (format) {
    case "json":
      return toJson(result);
    case "csv":
      return toCsv(result);
    case "txt":
      return toTxt(result);
  }
}

export function ExportMenu({ result }: { result: ScanResult }) {
  const [format, setFormat] = useState<"json" | "csv" | "txt">("json");

  function download() {
    const config = FORMATS.find((f) => f.key === format)!;
    const blob = new Blob([generate(format, result)], { type: config.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assetlens-scan.${config.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "json" | "csv" | "txt")}
        className="h-9 rounded-md border border-slate-300 px-2 text-sm"
      >
        {FORMATS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={download}
        className="inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
      >
        Export
      </button>
    </div>
  );
}
