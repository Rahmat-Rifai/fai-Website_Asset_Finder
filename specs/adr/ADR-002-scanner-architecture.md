# ADR-002: Stateless scanner

- **Status:** Accepted
- **Context:** PRD §36 (Privacy) requires not storing scanned HTML, cookies,
  auth headers, or website credentials. MVP has no DB (§37).
- **Decision:** Each `/api/scan` invocation is self-contained. The `ScanResult`
  is built in-memory and returned; nothing is persisted. Rate limiting uses an
  in-memory (or platform KV-lite) counter keyed by IP.
- **Consequences:** Horizontal scaling is trivial; no PII at rest. History /
  saved scans are explicitly V1 features, out of MVP scope.
