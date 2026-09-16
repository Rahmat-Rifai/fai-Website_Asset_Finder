"use client";

import { UrlInput } from "@/components/scanner/UrlInput";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <main className="w-full max-w-4xl flex flex-col items-center gap-16 text-center">
        {/* Hero Section */}
        <section className="w-full max-w-3xl flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AssetLens
          </h1>
          <p className="text-lg text-slate-600">
            Inspect the assets behind any website.
          </p>
          <UrlInput />
          <p className="text-sm text-slate-500">No account required.</p>
        </section>

        {/* How it works */}
        <section className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                1
              </div>
              <h3 className="font-semibold text-slate-900">Enter URL</h3>
              <p className="text-sm text-slate-600">
                Masukkan URL website yang ingin dianalisis.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                2
              </div>
              <h3 className="font-semibold text-slate-900">Scan</h3>
              <p className="text-sm text-slate-600">
                AssetLens memindai asset, metadata, warna, font, dan teknologi.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                3
              </div>
              <h3 className="font-semibold text-slate-900">Get Report</h3>
              <p className="text-sm text-slate-600">
                Dapatkan laporan terstruktur yang siap dipakai.
              </p>
            </div>
          </div>
        </section>

        {/* What we detect */}
        <section className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            What we detect
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              "Framework & Library",
              "CMS & Platform",
              "Analytics & Tracking",
              "Color Palette",
              "Typography",
              "Media Assets",
              "Meta & SEO Tags",
              "Hosting & CDN",
            ].map((item) => (
              <div
                key={item}
                className="p-4 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Mockup Example */}
        {/* TODO: Replace with real screenshot once scan result UI is stable */}
        <section className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            Example Output
          </h2>
          <div className="w-full p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-6 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="font-mono text-sm text-slate-500">example.com</p>
                <h3 className="font-bold text-slate-900">Example Domain</h3>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Next.js
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                  Vercel
                </span>
              </div>
            </div>
            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color palette */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Colors
                </p>
                <div className="flex gap-2">
                  <div className="h-10 w-10 rounded bg-[#0F172A] border border-slate-200" title="#0F172A"></div>
                  <div className="h-10 w-10 rounded bg-[#FFFFFF] border border-slate-200" title="#FFFFFF"></div>
                  <div className="h-10 w-10 rounded bg-[#3B82F6] border border-slate-200" title="#3B82F6"></div>
                  <div className="h-10 w-10 rounded bg-[#64748B] border border-slate-200" title="#64748B"></div>
                </div>
              </div>
              {/* Fonts */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Fonts
                </p>
                <p className="text-sm text-slate-700">
                  Inter
                </p>
                <p className="text-sm text-slate-700">
                  Geist Mono
                </p>
              </div>
            </div>
            {/* Asset stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">42</p>
                <p className="text-xs text-slate-500">Images</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">14</p>
                <p className="text-xs text-slate-500">Scripts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">6</p>
                <p className="text-xs text-slate-500">Stylesheets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">4</p>
                <p className="text-xs text-slate-500">Fonts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8">
            Who is it for?
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-6 border border-slate-200 rounded-lg bg-white text-left">
              <h3 className="font-semibold text-slate-900 mb-1">Web Developers</h3>
              <p className="text-sm text-slate-600">
                Research competitor tech stacks and discover frameworks.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg bg-white text-left">
              <h3 className="font-semibold text-slate-900 mb-1">Designers</h3>
              <p className="text-sm text-slate-600">
                Find fonts and color palettes for inspiration.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
