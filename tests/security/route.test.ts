import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/scan/route";

function jsonRequest(body: unknown, ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/scan", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/scan", () => {
  it("returns a ScanResult on success", async () => {
    const html = "<html><head><title>OK</title></head><body></body></html>";
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(html, {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    );

    const res = await POST(
      jsonRequest({ url: "https://example.com" }, "test-ok"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.url).toBe("https://example.com/");
    expect(json.data.title).toBe("OK");
  });

  it("rejects a missing URL with 400", async () => {
    const res = await POST(jsonRequest({}, "test-missing"));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe("INVALID_URL");
  });

  it("rejects non-http protocols without leaking stack traces", async () => {
    const res = await POST(
      jsonRequest({ url: "file:///etc/passwd" }, "test-file"),
    );
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error.code).toBe("BLOCKED_URL");
    expect(json.error.message).not.toContain("at ");
    expect(json.stack).toBeUndefined();
  });

  it("blocks SSRF attempts to loopback", async () => {
    const res = await POST(
      jsonRequest({ url: "http://127.0.0.1/" }, "test-ssrf"),
    );
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error.code).toBe("SSRF_BLOCKED");
  });

  it("rate limits the 11th scan from one IP in an hour", async () => {
    const html = "<html><head><title>r</title></head></html>";
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(html, {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    );

    const ip = "9.9.9.9";
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const res = await POST(jsonRequest({ url: "https://example.com" }, ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
