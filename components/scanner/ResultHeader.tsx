import type { ScanResult } from "@/types/scanner";
import { Badge } from "@/components/ui/Badge";

export function ResultHeader({ result }: { result: ScanResult }) {
  return (
    <header className="border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-bold text-foreground break-all">
        {result.title ?? result.url}
      </h1>
      <p className="mt-1 text-sm text-slate-500 break-all">{result.finalUrl}</p>
      <div className="mt-2">
        <Badge tone="green">Scan completed</Badge>
        <span className="ml-2 text-xs text-slate-400">
          {new Date(result.scannedAt).toLocaleString()}
        </span>
      </div>
    </header>
  );
}
