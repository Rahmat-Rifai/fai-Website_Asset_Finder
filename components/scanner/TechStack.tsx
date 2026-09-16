import type { ScanResult } from "@/types/scanner";
import { Badge } from "@/components/ui/Badge";

const toneByCategory: Record<string, "blue" | "green" | "neutral"> = {
  Framework: "blue",
  CSS: "green",
  CMS: "neutral",
  Hosting: "neutral",
  Analytics: "neutral",
  CDN: "neutral",
};

export function TechStack({ result }: { result: ScanResult }) {
  if (result.technologies.length === 0) {
    return <p className="text-sm text-slate-400">No technologies detected.</p>;
  }

  const grouped = Object.groupBy(result.technologies, (t) => t.category) as
    | Record<string, ScanResult["technologies"]>
    | undefined;

  return (
    <div className="space-y-4">
      {Object.entries(grouped ?? {}).map(([category, techs]) => (
        <div key={category}>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {techs?.map((tech) => (
              <Badge
                key={tech.name}
                tone={toneByCategory[category] ?? "neutral"}
              >
                ✓ {tech.name}{" "}
                <span className="ml-1 text-[10px] opacity-60">
                  {Math.round(tech.confidence * 100)}%
                </span>
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
