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
    name: "SvelteKit",
    category: "Framework",
    confidence: 0.9,
    test: ($) => !!$('script[src*="/app/"]')?.length || !!$('link[rel="modulepreload"][href*="svelte"]').length,
  },
  {
    name: "Nuxt",
    category: "Framework",
    confidence: 0.95,
    test: ($) => !!$('script[src*="/_nuxt/"]').length || !!$('meta[name="nuxt"]').length,
  },
  {
    name: "Remix",
    category: "Framework",
    confidence: 0.9,
    test: ($) => !!$('link[rel="modulepreload"][href*="remix"]').length || !!$('script[src*="/assets/"]').length,
  },
  {
    name: "Gatsby",
    category: "Framework",
    confidence: 0.9,
    test: ($) => !!$('script[src*="gatsby"]').length || !!$('link[rel="preload"][href*="webpack"]').length,
  },
  {
    name: "Angular",
    category: "Framework",
    confidence: 0.85,
    test: ($) =>
      !!$("[ng-version]").length || !!$('script[src*="angular"]').length,
  },
  {
    name: "Laravel",
    category: "Framework",
    confidence: 0.8,
    test: ($) =>
      !!$('meta[name="laravel-session"]').length ||
      !!$('script[src*="laravel"]').length ||
      !!$('link[href*="laravel"]').length,
  },
  {
    name: "Django",
    category: "Framework",
    confidence: 0.85,
    test: ($) =>
      !!$('meta[name="csrf-token"]').length || !!$('script[src*="django"]').length,
  },
  {
    name: "Symfony",
    category: "Framework",
    confidence: 0.8,
    test: ($) =>
      !!$('meta[name="symfony"]').length || !!$('link[href*="symfony"]').length,
  },
  {
    name: "Ruby on Rails",
    category: "Framework",
    confidence: 0.85,
    test: ($) =>
      !!$('meta[name="csrf-token"]').length || !!$('script[src*="rails"]').length ||
      !!$('link[href*="rails"]').length,
  },
  {
    name: "ASP.NET",
    category: "Framework",
    confidence: 0.8,
    test: ($) =>
      !!$('input[name="__VIEWSTATE"]').length ||
      !!$('script[src*="WebResource.axd"]').length ||
      !!$('link[href*="WebResource.axd"]').length,
  },
  {
    name: "Blazor",
    category: "Framework",
    confidence: 0.85,
    test: ($) => !!$('script[src*="_blazor"]').length || !!$('link[href*="blazor"]').length,
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
    name: "Bulma",
    category: "CSS",
    confidence: 0.9,
    test: ($) =>
      !!$('link[href*="bulma"]').length ||
      !!$("[class*='columns'], [class*='column']").length,
  },
  {
    name: "Materialize",
    category: "CSS",
    confidence: 0.85,
    test: ($) =>
      !!$('link[href*="materialize"]').length ||
      !!$("[class*='row'], [class*='col']").length,
  },
  {
    name: "Foundation",
    category: "CSS",
    confidence: 0.85,
    test: ($) =>
      !!$('link[href*="foundation"]').length ||
      !!$("[class*='row'], [class*='columns']").length,
  },
  {
    name: "Semantic UI",
    category: "CSS",
    confidence: 0.85,
    test: ($) =>
      !!$('link[href*="semantic"]').length ||
      !!$("[class*='ui']").length,
  },
  {
    name: "UIkit",
    category: "CSS",
    confidence: 0.85,
    test: ($) =>
      !!$('link[href*="uikit"]').length ||
      !!$("[class*='uk-']").length,
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
    name: "Drupal",
    category: "CMS",
    confidence: 0.85,
    test: ($) =>
      !!$('meta[name="Generator"][content*="Drupal"]').length ||
      !!$('link[href*="sites/default/files"]').length,
  },
  {
    name: "Joomla",
    category: "CMS",
    confidence: 0.8,
    test: ($) =>
      !!$('meta[name="generator"][content*="Joomla"]').length ||
      !!$('link[href*="/media/system/css/"]').length,
  },
  {
    name: "Vercel",
    category: "Hosting",
    confidence: 0.9,
    test: ($) =>
      !!$('meta[name="vercel"]').length || !!$('script[src*="vercel"]').length,
  },
  {
    name: "Netlify",
    category: "Hosting",
    confidence: 0.85,
    test: ($) =>
      !!$('meta[name="netlify"]').length ||
      !!$('link[href*="netlify"]').length ||
      !!$('script[src*="netlify"]').length,
  },
  {
    name: "Firebase",
    category: "Hosting",
    confidence: 0.8,
    test: ($) =>
      !!$('script[src*="firebase"]').length ||
      !!$('link[href*="firebase"]').length,
  },
  {
    name: "AWS Amplify",
    category: "Hosting",
    confidence: 0.8,
    test: ($) =>
      !!$('script[src*="aws-amplify"]').length ||
      !!$('link[href*="aws-amplify"]').length,
  },
  {
    name: "Heroku",
    category: "Hosting",
    confidence: 0.75,
    test: ($) =>
      !!$('link[href*="heroku"]').length ||
      !!$('meta[content*="Heroku"]').length,
  },
  {
    name: "Surge.sh",
    category: "Hosting",
    confidence: 0.7,
    test: ($) =>
      !!$('link[href*="surge.sh"]').length ||
      !!$('meta[content*="surge.sh"]').length,
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
  {
    name: "Facebook Pixel",
    category: "Analytics",
    confidence: 0.9,
    test: ($) =>
      !!$('script[src*="connect.facebook.net"]').length ||
      !!$("script").text().includes("fbq("),
  },
  {
    name: "Hotjar",
    category: "Analytics",
    confidence: 0.85,
    test: ($) =>
      !!$('script[src*="hotjar"]').length ||
      !!$("script").text().includes("hj("),
  },
  {
    name: "Mixpanel",
    category: "Analytics",
    confidence: 0.85,
    test: ($) =>
      !!$('script[src*="mixpanel"]').length ||
      !!$("script").text().includes("mixpanel.init"),
  },
  {
    name: "Amplitude",
    category: "Analytics",
    confidence: 0.8,
    test: ($) =>
      !!$('script[src*="amplitude"]').length ||
      !!$("script").text().includes("amplitude.getInstance"),
  },
  {
    name: "Segment",
    category: "Analytics",
    confidence: 0.8,
    test: ($) =>
      !!$('script[src*="analytics"]').length ||
      !!$("script").text().includes("analytics.load"),
  },
  // Additional signal: known script/CDN hostnames in script or CSS URLs
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
      ["fonts.googleapis.com", "Google Fonts", 0.95],
      ["use.typekit.net", "Adobe Fonts", 0.9],
      ["cdn.tailwindcss.com", "Tailwind CDN", 0.9],
      ["code.jquery.com", "jQuery CDN", 0.9],
      ["stackpath.bootstrapcdn.com", "Bootstrap CDN", 0.9],
      ["cdn.jsdelivr.net/npm/bootstrap", "Bootstrap CDN", 0.9],
      ["cdn.jsdelivr.net/npm/vue", "Vue CDN", 0.9],
      ["cdn.jsdelivr.net/npm/react", "React CDN", 0.9],
      ["unpkg.com/react", "React CDN", 0.9],
      ["unpkg.com/vue", "Vue CDN", 0.9],
      ["unpkg.com/alpinejs", "Alpine.js CDN", 0.9],
      ["cdn.jsdelivr.net/npm/alpinejs", "Alpine.js CDN", 0.9],
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
