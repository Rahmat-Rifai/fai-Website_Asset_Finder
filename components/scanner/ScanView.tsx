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
import { BulkExportMenu } from "@/components/scanner/BulkExportMenu";

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

type BulkStatus = "queued" | "scanning" | "done" | "failed";

interface BulkScanResultWithStatus {
  url: string;
  status: BulkStatus;
  data: ScanResult | null;
  error: { code: string; message: string } | null;
}

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

  const [bulkResults, setBulkResults] = useState<{
    loading: boolean;
    error: string | null;
    results: BulkScanResultWithStatus[] | null;
  }>(() => {
    if (!isBulk) return { loading: false, error: null, results: null };
    const raw =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("assetlens-bulk-urls")
        : null;
    if (!raw)
      return {
        loading: false,
        error: "No URLs found. Go back and enter URLs.",
        results: null,
      };
    const urls: string[] = JSON.parse(raw);
    const initial: BulkScanResultWithStatus[] = urls.map((u) => ({
      url: u,
      status: "queued" as const,
      data: null,
      error: null,
    }));
    return { loading: true, error: null, results: initial };
  });

  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    let cancelled = false;

    if (isBulk && bulkResults?.results) {
      const MAX_CONCURRENCY = 3;
      const urls = bulkResults.results.map((r) => r.url);
      let idx = 0;

      async function processQueue() {
        const workers: Promise<void>[] = [];

        for (let w = 0; w < MAX_CONCURRENCY; w++) {
          workers.push(
            (async () => {
              while (idx < urls.length) {
                const current = idx++;
                const targetUrl = urls[current];

                if (!cancelled) {
                  setBulkResults((prev) => {
                    if (!prev?.results) return prev;
                    const copy = [...prev.results];
                    copy[current] = { ...copy[current], status: "scanning" };
                    return { ...prev, results: copy };
                  });
                }

                try {
                  const res = await fetch("/api/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: targetUrl }),
                  });
                  const json = await res.json();

                  if (!cancelled) {
                    if (json.success) {
                      setBulkResults((prev) => {
                        if (!prev?.results) return prev;
                        const copy = [...prev.results];
                        copy[current] = {
                          ...copy[current],
                          status: "done",
                          data: json.data as ScanResult,
                        };
                        return { ...prev, results: copy };
                      });
                    } else {
                      setBulkResults((prev) => {
                        if (!prev?.results) return prev;
                        const copy = [...prev.results];
                        copy[current] = {
                          ...copy[current],
                          status: "failed",
                          error: {
                            code: json.error?.code ?? "UNKNOWN_ERROR",
                            message: json.error?.message ?? "Scan failed",
                          },
                        };
                        return { ...prev, results: copy };
                      });
                    }
                  }
                } catch {
                  if (!cancelled) {
                    setBulkResults((prev) => {
                      if (!prev?.results) return prev;
                      const copy = [...prev.results];
                      copy[current] = {
                        ...copy[current],
                        status: "failed",
                        error: {
                          code: "FETCH_FAILED",
                          message: "Network error",
                        },
                      };
                      return { ...prev, results: copy };
                    });
                  }
                } finally {
                  // Next item
                }
              }
            })(),
          );
        }

        await Promise.all(workers);

        if (!cancelled) {
          setBulkResults((prev) => (prev ? { ...prev, loading: false } : prev));
        }
      }

      processQueue().catch(() => {
        if (!cancelled) {
          setBulkResults((prev) =>
            prev
              ? { ...prev, loading: false, error: "Bulk scan failed" }
              : prev,
          );
        }
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, isBulk]);

  if (isBulk) {
    if (bulkResults.error)
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {bulkResults.error}
        </div>
      );
    if (!bulkResults.results) return null;

    const total = bulkResults.results.length;
    const completed = bulkResults.results.filter(
      (r) => r.status === "done" || r.status === "failed",
    ).length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const exportableResults: BulkScanResult[] = bulkResults.results.map((r) => ({
      url: r.url,
      success: r.status === "done",
      data: r.data ?? undefined,
      error: r.error ?? undefined,
    }));

    return (
      <div className="w-full space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Bulk Scan Results
        </h2>

        {bulkResults.loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Scanning {completed + 1} of {total}...
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {bulkResults.results.map((r) => (
            <div
              key={r.url}
              className={`rounded-lg border p-4 ${
                r.status === "failed"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-sm font-medium text-slate-800 break-all">
                  {r.url}
                </p>
                <span className="shrink-0 text-sm">
                  {r.status === "queued" && <span title="Queued">⬜</span>}
                  {r.status === "scanning" && (
                    <span title="Scanning" className="animate-pulse">⏳</span>
                  )}
                  {r.status === "done" && (
                    <span title="Done" className="text-green-600">✅</span>
                  )}
                  {r.status === "failed" && (
                    <span title="Failed" className="text-red-600">❌</span>
                  )}
                </span>
              </div>

              {r.status === "done" && r.data && (
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
              )}

              {r.status === "failed" && r.error && (
                <div className="mt-2 text-sm text-red-600">
                  {r.error.code}: {r.error.message}
                </div>
              )}
            </div>
          ))}
        </div>

        {!bulkResults.loading && completed > 0 && (
          <BulkExportMenu results={exportableResults} />
        )}
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
