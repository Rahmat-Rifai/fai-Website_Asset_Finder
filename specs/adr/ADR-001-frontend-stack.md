# ADR-001: Frontend stack

- **Status:** Accepted
- **Context:** PRD mandates Next.js + TypeScript + Tailwind + Lucide for a
  developer-tool UI deployable at Rp0 on Vercel.
- **Decision:** Use Next.js App Router. Server Route Handler at `/api/scan`
  performs all outbound fetching so secrets/UA never reach the client bundle.
- **Consequences:** No separate backend service; Vercel serverless handles API.
  Client stays static (fast initial load). Future API/CLI/V2 can reuse
  `lib/scanner` modules unchanged.
