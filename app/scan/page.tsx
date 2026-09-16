import { Suspense } from "react";
import { ScanView } from "@/components/scanner/ScanView";

export const metadata = {
  title: "AssetLens — Scan Results",
};

export default function ScanPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-slate-500">
            Loading scan…
          </div>
        }
      >
        <ScanView />
      </Suspense>
    </div>
  );
}
