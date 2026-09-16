import dns from "node:dns/promises";
import { isPrivateIp } from "./ip-ranges";
import { ScanError } from "@/lib/scanner/errors";

/**
 * Resolve the hostname and assert every resolved address is a
 * public, non-private IP.  Throws SSRF_BLOCKED otherwise.
 */
export async function assertPublicHost(hostname: string): Promise<void> {
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, {
      all: true,
      family: 0, // IPv4 + IPv6
      verbatim: true,
    });
  } catch {
    throw new ScanError("FETCH_FAILED", "Unable to resolve the host.");
  }

  if (addrs.length === 0) {
    throw new ScanError("FETCH_FAILED", "Unable to resolve the host.");
  }

  for (const { address } of addrs) {
    if (isPrivateIp(address)) {
      throw new ScanError(
        "SSRF_BLOCKED",
        `Blocked internal address: ${address}`,
      );
    }
  }
}

/**
 * Full SSRF validation for a URL that has already been protocol-checked.
 * Use before each request hop.
 */
export async function validateUrlSsrf(url: URL): Promise<void> {
  // Block obvious non-routable hostnames
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) {
    throw new ScanError("SSRF_BLOCKED", "localhost is blocked.");
  }

  await assertPublicHost(url.hostname);
}
