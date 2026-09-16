import { describe, expect, it } from "vitest";
import { parseHtml } from "@/lib/scanner/parser";

describe("parseHtml", () => {
  it("parses images from src and srcset", () => {
    const html = `<img src="a.png" alt="A" width="10" height="20">
<img srcset="b.webp 1x, c.webp 2x">`;
    const assets = parseHtml(html);
    expect(assets.images.length).toBe(3);
    expect(assets.images[0].url).toBe("a.png");
    expect(assets.images[0].width).toBe(10);
    expect(assets.images[0].height).toBe(20);
    expect(assets.images[1].url).toBe("b.webp");
    expect(assets.images[2].url).toBe("c.webp");
  });

  it("parses stylesheets", () => {
    const html = `<link rel="stylesheet" href="/style.css" title="main">`;
    const assets = parseHtml(html);
    expect(assets.stylesheets.length).toBe(1);
    expect(assets.stylesheets[0].url).toBe("/style.css");
    expect(assets.stylesheets[0].name).toBe("main");
  });

  it("parses scripts", () => {
    const html = `<script src="/app.js" title="main">`;
    const assets = parseHtml(html);
    expect(assets.scripts.length).toBe(1);
    expect(assets.scripts[0].url).toBe("/app.js");
    expect(assets.scripts[0].name).toBe("main");
  });

  it("parses icons", () => {
    const html = `<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple.png">`;
    const assets = parseHtml(html);
    expect(assets.icons.length).toBe(2);
    expect(assets.icons[0].url).toBe("/favicon.ico");
    expect(assets.icons[1].url).toBe("/apple.png");
  });

  it("parses videos and audio", () => {
    const html = `<video src="/v.mp4"></video>
<audio src="/a.mp3"></audio>`;
    const assets = parseHtml(html);
    expect(assets.videos.length).toBe(1);
    expect(assets.audio.length).toBe(1);
    expect(assets.videos[0].url).toBe("/v.mp4");
    expect(assets.audio[0].url).toBe("/a.mp3");
  });

  it("parses fonts from @font-face", () => {
    const html = `<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
  }
</style>`;
    const assets = parseHtml(html);
    expect(assets.fonts.length).toBe(1);
    expect(assets.fonts[0].url).toBe("/fonts/inter.woff2");
    expect(assets.fonts[0].name).toBe("Inter");
    expect(assets.fonts[0].mime).toBe("font/woff2");
  });

  it("parses images from srcset, picture source, and og:image", () => {
    const html = `<img src="a.png" alt="A" width="10" height="20">
    <meta property="og:image" content="og-image.jpg">
    <picture>
      <source srcset="b.webp 1x, c.webp 2x">
      <img src="d.jpg">
    </picture>`;
    const assets = parseHtml(html);
    // a.png, d.jpg (img), b.webp, c.webp (picture source), og-image.jpg
    expect(assets.images.length).toBe(5);
    expect(assets.images.map((i) => i.url)).toEqual([
      "a.png",
      "d.jpg",
      "b.webp",
      "c.webp",
      "og-image.jpg",
    ]);
  });

  it("parses inline svg elements", () => {
    const html = `<svg id="test" width="100" height="50">
      <circle cx="50" cy="25" r="20" />
    </svg>`;
    const assets = parseHtml(html);
    expect(assets.svg.length).toBe(1);
    expect(assets.svg[0].url).toBe("inline-svg#test");
    expect(assets.svg[0].name).toBe("test");
    expect(assets.svg[0].width).toBe(100);
    expect(assets.svg[0].height).toBe(50);
  });

  it("parses videos from iframe and JSON-LD", () => {
    const html = `
      <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
      <iframe src="https://player.vimeo.com/video/123456789"></iframe>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Sample Video",
        "contentUrl": "https://example.com/video.mp4",
        "embedUrl": "https://example.com/embed/123"
      }
      </script>
    `;
    const assets = parseHtml(html);
    expect(assets.videos.length).toBe(4);
    const urls = assets.videos.map((v) => v.url);
    expect(urls).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(urls).toContain("https://player.vimeo.com/video/123456789");
    expect(urls).toContain("https://example.com/video.mp4");
    expect(urls).toContain("https://example.com/embed/123");
  });

  it("throws PARSING_FAILED on empty HTML", () => {
    expect(() => parseHtml("")).toThrowError(
      expect.objectContaining({ code: "PARSING_FAILED" }),
    );
    expect(() => parseHtml("   ")).toThrowError(
      expect.objectContaining({ code: "PARSING_FAILED" }),
    );
  });
});
