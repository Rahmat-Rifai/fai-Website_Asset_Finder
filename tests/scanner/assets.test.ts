import { describe, expect, it } from "vitest";
import { parseHtml } from "@/lib/scanner/parser";
import { buildAssets } from "@/lib/scanner/assets";

describe("buildAssets", () => {
  it("resolves relative URLs and removes duplicates", () => {
    const parsed = parseHtml(`
      <img src="/images/logo.png" alt="logo">
      <img src="https://cdn.example.com/logo.png" alt="remote">
      <img src="/images/logo.png" alt="duplicate">
      <link rel="stylesheet" href="/styles/site.css">
      <script src="/scripts/app.js"></script>
    `);

    const assets = buildAssets("https://example.com/page", parsed);

    expect(assets.images).toHaveLength(2);
    expect(assets.images[0].url).toBe("https://example.com/images/logo.png");
    expect(assets.images[0].type).toBe("image/png");
    expect(assets.stylesheets[0].url).toBe(
      "https://example.com/styles/site.css",
    );
    expect(assets.scripts[0].url).toBe("https://example.com/scripts/app.js");
  });

  it("preserves optional dimensions and null defaults", () => {
    const assets = buildAssets(
      "https://example.com",
      parseHtml(`<img src="/hero.webp" width="640" height="480">`),
    );

    expect(assets.images[0].width).toBe(640);
    expect(assets.images[0].height).toBe(480);
    expect(assets.images[0].size).toBeNull();
  });
});
