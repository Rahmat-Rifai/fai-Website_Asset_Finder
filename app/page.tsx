"use client";

import { UrlInput } from "@/components/scanner/UrlInput";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <main className="w-full max-w-3xl flex flex-col items-center gap-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AssetLens
        </h1>
        <p className="text-lg text-slate-600">
          Inspect the assets behind any website.
        </p>
        <UrlInput />
        <p className="text-sm text-slate-500">No account required.</p>
      </main>
    </div>
  );
}
