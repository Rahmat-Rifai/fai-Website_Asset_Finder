# ADR-003: SSRF defense

- **Status:** Accepted
- **Context:** The server issues outbound HTTP requests from user-supplied
  URLs (PRD §9, §35). This is the top security risk; a bypass could reach
  internal services or cloud metadata.
- **Decision:** Defense in depth —
  1. Protocol allowlist: only `http`/`https`.
  2. Parse + normalise URL (reject `javascript:`, `file:`, `ftp:`, etc.).
  3. Before each request/redirect hop, resolve the hostname via DNS and
     verify the resolved IP is **not** loopback, RFC1918 private, link-local
     (`169.254.0.0/16`), or the cloud metadata endpoint (`169.254.169.254`).
  4. Re-validate every redirect target (PRD §9 example: example.com -> 127.0.0.1 must be blocked).
  5. Enforce ≤5 redirects, 10s timeout, 5MB body cap.
- **Consequences:** Adds an async DNS-resolve step per hop; slight latency cost
  but mandatory. Heuristic IP checks may miss exotic ranges — documented risk
  in SCOPE_LATEST.
