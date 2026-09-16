import { describe, expect, it } from "vitest";
import { load } from "cheerio";
import { extractColors } from "@/lib/scanner/colors";

describe("extractColors", () => {
  it("extracts hex colours from style blocks", () => {
    const $ = load(`
      <style>
        :root { --bg: #f8fafc; --fg: #0f172a; }
        body { color: #0f172a; }
      </style>
    `);
    const colors = extractColors($);
    expect(colors).toContain("#f8fafc");
    expect(colors).toContain("#0f172a");
  });

  it("normalises rgb() to hex", () => {
    const $ = load(`<style>p { color: rgb(255, 0, 0); }</style>`);
    const colors = extractColors($);
    expect(colors).toContain("#ff0000");
  });

  it("normalises shorthand hex", () => {
    const $ = load(`<style>p { color: #abc; }</style>`);
    const colors = extractColors($);
    expect(colors).toContain("#aabbcc");
  });

  it("returns empty array when no colours found", () => {
    const $ = load("<html><body></body></html>");
    const colors = extractColors($);
    expect(colors).toEqual([]);
  });
});
