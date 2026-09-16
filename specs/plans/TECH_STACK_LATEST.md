# AssetLens — Tech Stack & Architecture

Source: PRD §32–§34, §46. Locked for the MVP.

## Stack

- **Framework:** Next.js (App Router) — PRD mandates Next.js.
- **Language:** TypeScript (strict).
- **Styling:** Tailwind CSS.
- **Icons:** Lucide (`lucide-react`).
- **HTML parsing:** `cheerio`.
- **HTTP fetch (server):** `undici` (Node built-in fetch is acceptable on Node 24; use it with explicit timeout, signal, size limit). PRD specifies `AssetLensBot/1.0` UA.
- **Testing:** `vitest` (unit + security + integration). PRD §43 requires URL validation, SSRF, asset/metadata/color/tech extraction, and `POST /api/scan` integration tests.
- **Export:** pure TS modules (no deps) for JSON / CSV / TXT.
- **No DB, no auth, no paid/AI APIs** for MVP.

## Architecture (per PRD §33)

```
app/api/scan/route.ts
  -> security/url.ts        (validate + normalise URL)
  -> security/ssrf.ts       (resolve DNS, block private/loopback/link-local/metadata, cap redirects)
  -> scanner/fetcher.ts     (GET, timeout, size cap, redirect limit, content-type check)
  -> scanner/parser.ts      (cheerio load)
       -> assets.ts, metadata.ts, fonts.ts, colors.ts, technologies.ts
  -> ScanResult (types/scanner.ts)
```

## Key locked decisions (ADRs)

- **ADR-001** Next.js App Router + Route Handler for `/api/scan`; server-side only, no secret on client.
- **ADR-002** Stateless scanner: each `/api/scan` request is self-contained, results discarded after return (PRD §36 privacy).
- **ADR-003** SSRF defense = protocol allowlist + DNS resolution of final host + block RFC1918 / loopback / link-local / `169.254.169.254` + re-validate every redirect hop (PRD §9, §35).

## Project layout (PRD §34)

```
app/{page.tsx,layout.tsx,globals.css,scan/page.tsx,api/scan/route.ts}
components/scanner/*  components/ui/*
lib/scanner/*  lib/security/*  lib/export/*
types/scanner.ts
tests/{scanner,security}/*
.env.example  README.md
```

## Constraints (PRD §35, §40)

- Timeout 10s; response ≤5MB; ≤5 redirects; rate limit 10/IP/hour.
- Initial load <2s; scan <5s for simple sites; max 10s scanner exec.
- Image previews lazy-loaded.
