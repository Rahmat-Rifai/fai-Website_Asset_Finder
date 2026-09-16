import { describe, expect, it } from "vitest";
import { load } from "cheerio";
import { extractMetadata } from "@/lib/scanner/metadata";

describe("extractMetadata", () => {
  it("extracts title, description, canonical, OG, and Twitter", () => {
    const html = `<!doctype html>
<html>
<head>
  <title>Example Page</title>
  <meta name="description" content="A demo page">
  <link rel="canonical" href="https://example.com/page">
  <meta property="og:title" content="OG Title">
  <meta property="og:image" content="https://example.com/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Twitter Title">
</head>
<body></body>
</html>`;

    const $ = load(html);
    const result = extractMetadata($);

    expect(result.title).toBe("Example Page");
    expect(result.description).toBe("A demo page");
    expect(result.canonical).toBe("https://example.com/page");
    expect(result.openGraph["og:title"]).toBe("OG Title");
    expect(result.openGraph["og:image"]).toBe("https://example.com/og.png");
    expect(result.twitter["twitter:card"]).toBe("summary_large_image");
    expect(result.twitter["twitter:title"]).toBe("Twitter Title");
  });

  it("returns null values for missing meta", () => {
    const $ = load("<html><body></body></html>");
    const result = extractMetadata($);

    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.canonical).toBeNull();
    expect(result.openGraph).toEqual({});
    expect(result.twitter).toEqual({});
  });
});
