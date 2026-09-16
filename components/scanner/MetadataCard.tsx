import type { ScanResult } from "@/types/scanner";
import { Card } from "@/components/ui/Card";

export function MetadataCard({ result }: { result: ScanResult }) {
  const { metadata } = result;
  const hasAnything =
    metadata.title ||
    metadata.description ||
    metadata.canonical ||
    Object.keys(metadata.openGraph).length > 0 ||
    Object.keys(metadata.twitter).length > 0;

  if (!hasAnything) {
    return <p className="text-sm text-slate-400">No metadata detected.</p>;
  }

  return (
    <div className="space-y-4">
      {(metadata.title || metadata.description || metadata.canonical) && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Basic Metadata
          </h3>
          <dl className="space-y-2 text-sm">
            {metadata.title && <Row label="Title" value={metadata.title} />}
            {metadata.description && (
              <Row label="Description" value={metadata.description} />
            )}
            {metadata.canonical && (
              <Row label="Canonical" value={metadata.canonical} />
            )}
          </dl>
        </Card>
      )}

      {Object.keys(metadata.openGraph).length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Open Graph
          </h3>
          <dl className="space-y-2 text-sm">
            {Object.entries(metadata.openGraph).map(([key, value]) => (
              <Row key={key} label={key} value={value} />
            ))}
          </dl>
        </Card>
      )}

      {Object.keys(metadata.twitter).length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Twitter Card
          </h3>
          <dl className="space-y-2 text-sm">
            {Object.entries(metadata.twitter).map(([key, value]) => (
              <Row key={key} label={key} value={value} />
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="min-w-[140px] font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-900 break-all">{value}</dd>
    </div>
  );
}
