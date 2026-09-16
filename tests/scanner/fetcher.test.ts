import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWebsite } from "@/lib/scanner/fetcher";

beforeEach(() => {
  vi.restoreAllMocks();
});

function makeResponse(
  body: string | null,
  init: ResponseInit & { headers?: Record<string, string> } = {},
) {
  const headers = new Headers(init.headers);
  return new Response(body, { ...init, headers });
}

describe("fetchWebsite", () => {
  it("returns html on success", async () => {
    const html = "<html><body>ok</body></html>";
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse(html, {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    );
    const result = await fetchWebsite("https://example.com");
    expect(result.html).toBe(html);
    expect(result.finalUrl).toBe("https://example.com/");
    expect(result.status).toBe(200);
  });

  it("follows redirects up to the limit", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn((url: URL | string) => {
        const href = typeof url === "string" ? url : url.href;
        calls.push(href);
        if (href.includes("/hop1")) {
          return Promise.resolve(
            makeResponse(null, { status: 301, headers: { location: "/hop2" } }),
          );
        }
        return Promise.resolve(
          makeResponse("<html></html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        );
      }),
    );
    const result = await fetchWebsite("https://example.com/hop1");
    expect(result.status).toBe(200);
    expect(calls.length).toBe(2);
  });

  it("throws FETCH_FAILED on too many redirects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse(null, { status: 302, headers: { location: "/loop" } }),
        ),
      ),
    );
    await expect(
      fetchWebsite("https://example.com/loop", { maxRedirects: 2 }),
    ).rejects.toThrowError(expect.objectContaining({ code: "FETCH_FAILED" }));
  });

  it("throws BLOCKED_URL on redirect to non-http protocol", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse(null, {
            status: 302,
            headers: { location: "ftp://evil.com/" },
          }),
        ),
      ),
    );
    await expect(fetchWebsite("https://example.com")).rejects.toThrowError(
      expect.objectContaining({ code: "BLOCKED_URL" }),
    );
  });

  it("throws INVALID_CONTENT_TYPE for non-html response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse("{}", {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
    );
    await expect(fetchWebsite("https://example.com")).rejects.toThrowError(
      expect.objectContaining({ code: "INVALID_CONTENT_TYPE" }),
    );
  });

  it("throws RESPONSE_TOO_LARGE when body exceeds maxBytes", async () => {
    const bigBody = "x".repeat(1000);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse(bigBody, {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    );
    await expect(
      fetchWebsite("https://example.com", { maxBytes: 500 }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: "RESPONSE_TOO_LARGE" }),
    );
  });

  it("throws SSRF_BLOCKED when redirect targets a private IP", async () => {
    // First hop returns 301 to http://169.254.169.254/ (link-local / metadata)
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          makeResponse(null, {
            status: 301,
            headers: { location: "http://169.254.169.254/" },
          }),
        ),
      ),
    );
    await expect(fetchWebsite("https://example.com")).rejects.toThrowError(
      expect.objectContaining({ code: "SSRF_BLOCKED" }),
    );
  });
});
