import type { ScanResult } from "@/types/scanner";

export function ColorPalette({ result }: { result: ScanResult }) {
  if (result.colors.length === 0) {
    return <p className="text-sm text-slate-400">No colors detected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {result.colors.map((hex) => (
        <div key={hex} className="flex flex-col items-center gap-1">
          <div
            className="h-10 w-10 rounded-md border border-slate-200"
            style={{ backgroundColor: hex }}
            aria-label={`Color ${hex}`}
          />
          <span className="font-mono text-xs text-slate-500">{hex}</span>
        </div>
      ))}
    </div>
  );
}
