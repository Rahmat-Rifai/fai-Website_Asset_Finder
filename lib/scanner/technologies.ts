import type { Technology } from "@/types/scanner";
import type { CheerioAPI } from "cheerio";

interface Pattern {
  name: string;
  category: string;
  confidence: number;
  test: ($: CheerioAPI) => boolean;
}

const PATTERNS: Pattern[] = [
  {
    name: "Next.js",
    category: "Framework",
    confidence: 0.95,
    test: ($) =>
      !!$('script[src*="/_next/"]').length ||
      !!$('meta[name="next-head"]').length ||
      !!$("#__next").length,
  },
  {
    name: "React",
    category: "Framework",
    confidence: 0.9,
    test: ($) =>
      !!$("#__next, #root, [data-reactroot]").length ||
      !!$('script[src*="react"]').length,
  },
  {
    name: "Vue",
    category: "Framework",
    confidence: 0.9,
    test: ($) =>
      !!$("[data-v-app]").length ||
      !!$('script[src*="vue"]').length ||
      !!$("#app").length,
  },
  {
    name: "Svelte",
    category: "Framework",
    confidence: 0.85,
    test: ($) => !!$('script[src*="/_app"]').length,
  },
  {
    name: "Angular",
    category: "Framework",
    confidence: 0.85,
    test: ($) =>
      !!$("[ng-version]").length || !!$('script[src*="angular"]').length,
  },
  {
    name: "Tailwind CSS",
    category: "CSS",
    confidence: 0.95,
    test: ($) =>
      !!$('link[href*="tailwind"]').length ||
      !!$('script[src*="tailwind"]').length ||
      (!!$('meta[name="theme-color"]').length &&
        !!$("[class*='flex'], [class*='text-']").length),
  },
  {
    name: "Bootstrap",
    category: "CSS",
    confidence: 0.9,
    test: ($) =>
      !!$('link[href*="bootstrap"]').length ||
      (!!$('meta[name="viewport"]').length &&
        !!$("[class*='container-fluid']").length),
  },
  {
    name: "WordPress",
    category: "CMS",
    confidence: 0.95,
    test: ($) =>
      !!$('meta[name="generator"][content*="WordPress"]').length ||
      !!$('link[href*="wp-content"]').length,
  },
  {
    name: "Vercel",
    category: "Hosting",
    confidence: 0.9,
    test: ($) =>
      !!$('meta[name="vercel"]').length || !!$('script[src*="vercel"]').length,
  },
  {
    name: "Cloudflare",
    category: "Hosting",
    confidence: 0.85,
    test: ($) =>
      !!$('link[href*="cloudflare"]').length ||
      !!$('meta[content*="Cloudflare"]').length,
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    confidence: 0.95,
    test: ($) =>
      !!$('script[src*="googletagmanager"]').length ||
      !!$('script[src*="gtag"]').length ||
      !!$("script").text().includes("gtag("),
  },
];

/**
 * Heuristic technology detection. Returns an array of detected technologies
 * with name, category, and confidence (0-1). Not guaranteed accurate.
 */
export function detectTechnologies(
  $: CheerioAPI,
  scriptSrcs: string[],
  cssHrefs: string[],
): Technology[] {
  const detected: Technology[] = [];
  const seen = new Set<string>();

  for (const pattern of PATTERNS) {
    if (pattern.test($)) {
      if (!seen.has(pattern.name)) {
        detected.push({
          name: pattern.name,
          category: pattern.category,
          confidence: pattern.confidence,
        });
        seen.add(pattern.name);
      }
    }
  }

  // Additional signal: known script/CDN hostnames in script or CSS URLs
  const assetUrls = [...scriptSrcs, ...cssHrefs];
  for (const src of assetUrls) {
    const known: Array<[string, string, number]> = [
      ["cdn.jsdelivr.net", "Open Source CDN", 0.7],
      ["unpkg.com", "Open Source CDN", 0.7],
      ["cdnjs.cloudflare.com", "Cloudflare CDN", 0.8],
      ["ajax.googleapis.com", "Google CDN", 0.8],
    ];
    for (const [host, name, conf] of known) {
      if (src.includes(host) && !seen.has(name)) {
        detected.push({ name, category: "CDN", confidence: conf });
        seen.add(name);
      }
    }
  }

  return detected;
}
