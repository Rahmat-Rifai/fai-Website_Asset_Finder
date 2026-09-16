"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BulkScanResult, ScanResult } from "@/types/scanner";
import { ResultHeader } from "@/components/scanner/ResultHeader";
import { AssetStats } from "@/components/scanner/AssetStats";
import { AssetTable } from "@/components/scanner/AssetTable";
import { ImageGrid } from "@/components/scanner/ImageGrid";
import { MetadataCard } from "@/components/scanner/MetadataCard";
import { TechStack } from "@/components/scanner/TechStack";
import { ColorPalette } from "@/components/scanner/ColorPalette";
import { ExportMenu } from "@/components/scanner/ExportMenu";
import { ScanProgress } from "@/components/scanner/ScanProgress";

type Section =
  | "overview"
  | "assets"
  | "images"
  | "metadata"
  | "tech"
  | "colors";

const NAV: Array<{ key: Section; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "assets", label: "Assets" },
  { key: "images", label: "Images" },
  { key: "metadata", label: "Metadata" },
  { key: "tech", label: "Technologies" },
  { key: "colors", label: "Colors" },
];

export function ScanView() {
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const isBulk = params.get("bulk") === "true";

  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: ScanResult | null;
  }>(() =>
    url
      ? { loading: true, error: null, data: null }
      : { loading: false, error: null, data: null },
  );
  const [bulkState, setBulkState] = useState<{
    loading: boolean;
    error: string | null;
    results: BulkScanResult[] | null;
  }>(() => {
    if (!isBulk) return { loading: false, error: null, results: null };
    // sessionStorage is only available client-side.
    const raw =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("assetlens-bulk-urls")
        : null;
    if (!raw)
      return { loading: false, error: "No URLs found. Go back and enter URLs.", results: null };
    return { loading: true, error: null, results: null };
  });
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    let cancelled = false;

    if (isBulk) {
      const raw =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("assetlens-bulk-urls")
          : null;
      if (!raw) return; // already handled by initializer
      const urls: string[] = JSON.parse(raw);
      (async () => {
        try {
          const res = await fetch("/api/scan/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls }),
          });
          const json = await res.json();
          if (cancelled) return;
          if (json.success) {
            setBulkState({ loading: false, error: null, results: json.results });
          } else {
            setBulkState({
              loading: false,
              error: json.error ?? "Bulk scan failed",
              results: null,
            });
          }
        } catch {
          if (!cancelled) {
            setBulkState({
              loading: false,
              error: "Bulk scan failed",
              results: null,
            });
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      if (!url) return;
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setState({
            loading: false,
            error: null,
            data: json.data as ScanResult,
          });
        } else {
          const message = `${json.error?.code ?? "SCAN_FAILED"}: ${json.error?.message ?? "Scan failed"}`;
          setState({ loading: false, error: message, data: null });
        }
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: "Scan failed", data: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, isBulk]);

  if (isBulk) {
    if (bulkState.loading) return <ScanProgress />;
    if (bulkState.error)
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {bulkState.error}
        </div>
      );
    if (!bulkState.results) return null;

    return (
      <div className="w-full space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Bulk Scan Results ({bulkState.results.length})
        </h2>
        {bulkState.results.map((r) => (
          <div
            key={r.url}
            className="rounded-lg border border-slate-200 p-4"
          >
            <p className="font-mono text-sm font-medium text-slate-800">
              {r.url}
            </p>
            {r.success && r.data ? (
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  <strong>Title:</strong> {r.data.title ?? "—"}
                </p>
                <p>
                  <strong>Images:</strong> {r.data.assets.images.length} |{" "}
                  <strong>Scripts:</strong> {r.data.assets.scripts.length} |{" "}
                  <strong>CSS:</strong> {r.data.assets.stylesheets.length} |{" "}
                  <strong>Fonts:</strong> {r.data.assets.fonts.length}
                </p>
                <p>
                  <strong>Technologies:</strong>{" "}
                  {r.data.technologies.length > 0
                    ? r.data.technologies.map((t) => t.name).join(", ")
                    : "—"}
                </p>
                <a
                  href={`/scan?url=${encodeURIComponent(r.url)}`}
                  className="inline-block text-blue-600 hover:underline"
                >
                  View full results →
                </a>
              </div>
            ) : (
              <div className="mt-2 text-sm text-red-600">
                {r.error?.code ?? "UNKNOWN_ERROR"}:{" "}
                {r.error?.message ?? "Scan failed"}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!url) {
    return (
      <p className="text-slate-500">No URL provided. Go back and enter one.</p>
    );
  }

  if (state.loading) {
    return <ScanProgress />;
  }

  if (state.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {state.error}
      </div>
    );
  }

  if (!state.data) return null;
  const result = state.data;

  return (
    <div className="w-full space-y-6">
      <ResultHeader result={result} />

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {NAV.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              section === key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="min-h-[16rem]">
        {section === "overview" && <AssetStats result={result} />}
        {section === "assets" && <AssetTable result={result} />}
        {section === "images" && <ImageGrid result={result} />}
        {section === "metadata" && <MetadataCard result={result} />}
        {section === "tech" && <TechStack result={result} />}
        {section === "colors" && <ColorPalette result={result} />}
      </section>

      <div className="border-t border-slate-200 pt-4">
        <ExportMenu result={result} />
      </div>
    </div>
  );
}
