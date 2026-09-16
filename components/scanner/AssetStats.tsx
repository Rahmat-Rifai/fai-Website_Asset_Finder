import type { ScanResult } from "@/types/scanner";

const LABELS: Array<{ key: keyof ScanResult["assets"]; label: string }> = [
        { key: "images", label: "Images" },
        { key: "svg", label: "SVG" },
        { key: "scripts", label: "Scripts" },
        { key: "stylesheets", label: "CSS" },
        { key: "fonts", label: "Fonts" },
        { key: "icons", label: "Icons" },
        { key: "videos", label: "Videos" },
        { key: "audio", label: "Audio" },
];

export function AssetStats({ result }: { result: ScanResult }) {
        return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {LABELS.map(({ key, label }) => (
                                <div
                                        key={key}
                                        className="rounded-lg border border-slate-200 bg-white p-4 text-center"
                                >
                                        <div className="text-2xl font-bold text-slate-900">
                                                {result.assets[key].length}
                                        </div>
                                        <div className="text-xs uppercase tracking-wide text-slate-500">
                                                {label}
                                        </div>
                                </div>
                        ))}
                </div>
        );
}
