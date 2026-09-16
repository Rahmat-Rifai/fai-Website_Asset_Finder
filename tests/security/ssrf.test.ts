import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { validateUrlSsrf, assertPublicHost } from "@/lib/security/ssrf";

vi.mock("node:dns/promises", () => {
  const lookup = vi.fn();
  return { default: { lookup }, lookup };
});

import dns from "node:dns/promises";

const lookupMock = dns.lookup as unknown as Mock;

beforeEach(() => {
  lookupMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isPrivateIp via assertPublicHost", () => {
  it("blocks private IPv4", async () => {
    lookupMock.mockResolvedValue([{ address: "10.0.0.5", family: 4 }]);
    await expect(assertPublicHost("example.com")).rejects.toThrowError(
      expect.objectContaining({ code: "SSRF_BLOCKED" }),
    );
  });

  it("blocks loopback IPv4", async () => {
    lookupMock.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
    await expect(assertPublicHost("localhost")).rejects.toThrowError(
      expect.objectContaining({ code: "SSRF_BLOCKED" }),
    );
  });

  it("blocks link-local / metadata IP", async () => {
    lookupMock.mockResolvedValue([{ address: "169.254.169.254", family: 4 }]);
    await expect(assertPublicHost("metadata")).rejects.toThrowError(
      expect.objectContaining({ code: "SSRF_BLOCKED" }),
    );
  });

  it("blocks IPv6 loopback", async () => {
    lookupMock.mockResolvedValue([{ address: "::1", family: 6 }]);
    await expect(assertPublicHost("ipv6host")).rejects.toThrowError(
      expect.objectContaining({ code: "SSRF_BLOCKED" }),
    );
  });

  it("allows public IPv4", async () => {
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    await expect(assertPublicHost("example.com")).resolves.toBeUndefined();
  });

  it("allows public IPv6", async () => {
    lookupMock.mockResolvedValue([
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 },
    ]);
    await expect(assertPublicHost("example.com")).resolves.toBeUndefined();
  });
});

describe("validateUrlSsrf", () => {
  it("blocks localhost hostname directly", async () => {
    await expect(
      validateUrlSsrf(new URL("http://localhost/")),
    ).rejects.toThrowError(expect.objectContaining({ code: "SSRF_BLOCKED" }));
  });

  it("blocks .local hostnames", async () => {
    await expect(
      validateUrlSsrf(new URL("http://printer.local/")),
    ).rejects.toThrowError(expect.objectContaining({ code: "SSRF_BLOCKED" }));
  });

  it("propagates DNS resolution failure as FETCH_FAILED", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));
    await expect(
      validateUrlSsrf(new URL("http://nope.invalid/")),
    ).rejects.toThrowError(expect.objectContaining({ code: "FETCH_FAILED" }));
  });
});
