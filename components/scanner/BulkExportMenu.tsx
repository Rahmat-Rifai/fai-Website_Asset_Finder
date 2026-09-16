import type { BulkScanResult } from "@/types/scanner";

export function BulkExportMenu({ results }: { results: BulkScanResult[] }) {
  function download(format: "json" | "csv") {
    let content = "";
    let mime = "";
    let ext = "";

    if (format === "json") {
      content = JSON.stringify(results, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      mime = "text/csv";
      ext = "csv";
      const headers = [
        "url",
        "status",
        "title",
        "images",
        "scripts",
        "stylesheets",
        "fonts",
        "technologies",
        "colors",
        "error",
      ];
      const rows = [headers.join(",")];
      for (const r of results) {
        const cols = [
          r.url,
          r.success ? "success" : "failed",
          r.success ? r.data?.title ?? "" : "",
          r.success ? r.data?.assets.images.length ?? 0 : "",
          r.success ? r.data?.assets.scripts.length ?? 0 : "",
          r.success ? r.data?.assets.stylesheets.length ?? 0 : "",
          r.success ? r.data?.assets.fonts.length ?? 0 : "",
          r.success
            ? r.data?.technologies.map((t: { name: string }) => t.name).join("; ") ?? ""
            : "",
          r.success ? r.data?.colors.join("; ") ?? "" : "",
          r.success ? "" : r.error?.message ?? "",
        ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
        rows.push(cols.join(","));
      }
      content = rows.join("\n");
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assetlens-bulk-scan.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-white">
      <span className="text-sm font-medium text-slate-700">Export All:</span>
      <button
        type="button"
        onClick={() => download("json")}
        className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        JSON
      </button>
      <button
        type="button"
        onClick={() => download("csv")}
        className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        CSV
      </button>
    </div>
  );
}