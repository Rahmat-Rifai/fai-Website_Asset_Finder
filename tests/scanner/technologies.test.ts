import { describe, expect, it } from "vitest";
import { load } from "cheerio";
import { detectTechnologies } from "@/lib/scanner/technologies";

describe("detectTechnologies", () => {
  it("detects Next.js from _next scripts", () => {
    const $ = load('<script src="/_next/static/main.js"></script>');
    const tech = detectTechnologies($, ["/_next/static/main.js"], []);
    const next = tech.find((t) => t.name === "Next.js");
    expect(next).toBeDefined();
    expect(next!.confidence).toBeGreaterThan(0.9);
  });

  it("detects Tailwind from known link", () => {
    const $ = load('<link href="https://cdn.tailwindcss.com">');
    const tech = detectTechnologies($, [], ["https://cdn.tailwindcss.com"]);
    expect(tech.some((t) => t.name === "Tailwind CSS")).toBe(true);
  });

  it("detects Google Analytics from gtag script", () => {
    const $ = load(
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-123"></script>',
    );
    const tech = detectTechnologies(
      $,
      ["https://www.googletagmanager.com/gtag/js?id=G-123"],
      [],
    );
    expect(tech.some((t) => t.name === "Google Analytics")).toBe(true);
  });

  it("detects WordPress from generator meta", () => {
    const $ = load('<meta name="generator" content="WordPress 6.5">');
    const tech = detectTechnologies($, [], []);
    expect(tech.some((t) => t.name === "WordPress")).toBe(true);
  });

  it("detects React from #root container", () => {
    const $ = load('<div id="root"></div>');
    const tech = detectTechnologies($, [], []);
    expect(tech.some((t) => t.name === "React")).toBe(true);
  });

  it("returns empty when nothing matches", () => {
    const $ = load("<html><body><p>plain</p></body></html>");
    const tech = detectTechnologies($, [], []);
    expect(tech).toEqual([]);
  });
});
