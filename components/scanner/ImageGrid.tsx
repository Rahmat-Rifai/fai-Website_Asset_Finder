"use client";

import { useState } from "react";
import type { ScanResult } from "@/types/scanner";

function ImageCell({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="group relative flex flex-col items-center gap-1">
      {failed ? (
        <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
          Preview unavailable
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-32 w-full rounded-md border border-slate-200 object-contain"
        />
      )}
      <figcaption
        className="max-w-full truncate text-xs text-slate-500"
        title={name}
      >
        {name}
      </figcaption>
      <a
        href={`/api/asset?url=${encodeURIComponent(url)}`}
        download
        className="absolute right-1 top-1 hidden rounded bg-black/60 px-2 py-0.5 text-xs text-white group-hover:block"
      >
        Download
      </a>
    </figure>
  );
}

export function ImageGrid({ result }: { result: ScanResult }) {
  const items = [...result.assets.images, ...result.assets.svg];
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No images detected.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((asset) => (
        <ImageCell key={asset.url} url={asset.url} name={asset.name} />
      ))}
    </div>
  );
}
