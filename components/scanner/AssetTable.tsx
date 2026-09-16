"use client";

import { useMemo, useState } from "react";
import type { ScanResult } from "@/types/scanner";

const TABS: Array<{ key: keyof ScanResult["assets"]; label: string }> = [
  { key: "images", label: "Images" },
  { key: "svg", label: "SVG" },
  { key: "scripts", label: "Scripts" },
  { key: "stylesheets", label: "CSS" },
  { key: "fonts", label: "Fonts" },
  { key: "icons", label: "Icons" },
  { key: "videos", label: "Videos" },
  { key: "audio", label: "Audio" },
];

export function AssetTable({ result }: { result: ScanResult }) {
  const [tab, setTab] = useState<keyof ScanResult["assets"]>("images");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const filtered = result.assets[tab].filter((asset) =>
      asset.url.toLowerCase().includes(query.toLowerCase()),
    );
    return filtered;
  }, [result, tab, query]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label} ({result.assets[key].length})
          </button>
        ))}
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by URL..."
        aria-label="Filter assets"
        className="mb-3 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">URL</th>
      <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">MIME</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((asset) => (
              <tr key={asset.url} className="border-t border-slate-100">
                <td className="px-4 py-2">{asset.name}</td>
                <td className="px-4 py-2 text-slate-500">{asset.type}</td>
                <td className="px-4 py-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {asset.url}
                  </a>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {asset.mimeType ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <a
                    href={`/api/asset?url=${encodeURIComponent(asset.url)}`}
                    download
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
