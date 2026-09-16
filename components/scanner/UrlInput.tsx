"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const MAX_BULK_URLS = 10;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [bulk, setBulk] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (bulk) {
      const rawUrls = bulkUrls
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean);
      const urls = rawUrls.filter(isValidUrl);
      const invalidCount = rawUrls.length - urls.length;

      if (urls.length === 0) {
        setError("Masukkan setidaknya satu URL yang valid (http/https).");
        return;
      }

      if (urls.length > MAX_BULK_URLS) {
        setError(
          `Kamu memasukkan ${urls.length} URL, maksimal ${MAX_BULK_URLS}. Hapus ${urls.length - MAX_BULK_URLS} URL atau bagi jadi beberapa batch.`
        );
        return;
      }

      if (invalidCount > 0) {
        setError(`${invalidCount} baris tidak valid dan telah diabaikan.`);
        // Allow continue if at least one valid URL remains and count is within limit
        if (urls.length > MAX_BULK_URLS) return;
      }

      sessionStorage.setItem("assetlens-bulk-urls", JSON.stringify(urls));
      router.push("/scan?bulk=true");
    } else if (url.trim()) {
      if (!isValidUrl(url.trim())) {
        setError("URL harus diawali dengan http:// atau https://");
        return;
      }
      router.push(`/scan?url=${encodeURIComponent(url.trim())}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-3"
    >
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setBulk(false)}
          className={`rounded-md px-3 py-1 font-medium ${
            !bulk ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Single URL
        </button>
        <button
          type="button"
          onClick={() => setBulk(true)}
          className={`rounded-md px-3 py-1 font-medium ${
            bulk ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Bulk Scan
        </button>
      </div>

      {bulk ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={bulkUrls}
            onChange={(e) => {
              setBulkUrls(e.target.value);
              setError(null);
            }}
            placeholder="Satu URL per baris, maksimal 10 URL"
            rows={5}
            required
            aria-label="Website URLs (one per line, max 10)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
          />
          <p className="text-xs text-left text-slate-500">
            Tempel URL, satu per baris. Kami akan scan semuanya sekaligus dan
            tampilkan hasilnya per situs. Maks. 10 URL per scan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="url"
            inputMode="url"
            autoComplete="url"
            required
            placeholder="https://example.com"
            aria-label="Website URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full sm:w-auto shrink-0">
        {bulk ? "Scan All" : "Scan Website"}
      </Button>
    </form>
  );
}
