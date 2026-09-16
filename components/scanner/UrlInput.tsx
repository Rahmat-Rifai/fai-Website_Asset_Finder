"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [bulk, setBulk] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (bulk) {
      const urls = bulkUrls
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean);
      if (urls.length > 0) {
        sessionStorage.setItem("assetlens-bulk-urls", JSON.stringify(urls));
        router.push("/scan?bulk=true");
      }
    } else if (url.trim()) {
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
        <textarea
          value={bulkUrls}
          onChange={(e) => setBulkUrls(e.target.value)}
          placeholder={"https://example.com\nhttps://another.com\nhttps://third.com"}
          rows={4}
          required
          aria-label="Website URLs (one per line, max 5)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
        />
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
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      )}
      <Button type="submit" className="w-full sm:w-auto shrink-0">
        {bulk ? "Scan All" : "Scan Website"}
      </Button>
    </form>
  );
}
