import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanWebsite } from "@/lib/scanner/scanner";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("scanWebsite", () => {
  it("returns a full ScanResult for a real-looking HTML page", async () => {
    const html = `<!doctype html>
<html lang="en">
<head>
  <title>Test Site</title>
  <meta name="description" content="A test">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <meta property="og:title" content="OG Title">
  <script src="/_next/static/main.js"></script>
  <style>
    @font-face { font-family: 'Inter'; src: url('/fonts/inter.woff2'); }
    body { color: #171717; background: #ffffff; }
  </style>
</head>
<body>
  <h1>Hello</h1>
  <img src="/hero.png" alt="hero" width="640" height="480">
  <div id="root"></div>
</body>
</html>`;

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

    const result = await scanWebsite("https://example.com");

    expect(result.url).toBe("https://example.com/");
    expect(result.title).toBe("Test Site");
    expect(result.metadata.description).toBe("A test");
    expect(result.metadata.openGraph["og:title"]).toBe("OG Title");
    expect(result.assets.images.length).toBeGreaterThan(0);
    expect(result.assets.icons.length).toBeGreaterThan(0);
    expect(result.assets.fonts.length).toBeGreaterThan(0);
    expect(result.colors).toContain("#171717");
    expect(result.colors).toContain("#ffffff");
    expect(result.technologies.some((t) => t.name === "Next.js")).toBe(true);
    expect(result.technologies.some((t) => t.name === "React")).toBe(true);
    expect(result.scannedAt).toBeTruthy();
  });
});
