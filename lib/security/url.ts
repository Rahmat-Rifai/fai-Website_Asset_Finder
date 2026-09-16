import { ScanError } from "@/lib/scanner/errors";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Parse and normalise a raw URL string.
 * Rejects: non-http(s) protocols, embedded credentials, empty host.
 */
export function validateAndNormaliseUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ScanError("INVALID_URL");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new ScanError(
      "BLOCKED_URL",
      "Only http and https URLs are supported.",
    );
  }

  if (url.hostname.length === 0) {
    throw new ScanError("INVALID_URL");
  }

  // Block embedded credentials (user:pass@host)
  if (url.username.length > 0 || url.password.length > 0) {
    throw new ScanError("BLOCKED_URL", "Credentials in URL are not allowed.");
  }

  // Normalise: ensure trailing slash on bare domain, remove default ports
  if (url.port === "80" && url.protocol === "http:") {
    url.port = "";
  } else if (url.port === "443" && url.protocol === "https:") {
    url.port = "";
  }

  return url;
}
