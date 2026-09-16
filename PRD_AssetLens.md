# AssetLens

> Inspect the assets, metadata, and technology behind any website.

**Product Requirements Document (PRD)**  
**Version:** 1.0  
**Status:** MVP Development  
**Project Type:** Web SaaS / Developer Tool  
**Initial Cost:** Rp0

---

## 1. Product Overview

AssetLens adalah web-based developer tool untuk menganalisis sebuah website berdasarkan URL dan menampilkan aset serta informasi teknis yang dapat ditemukan dari halaman tersebut.

User cukup memasukkan URL:

```text
https://example.com
```

AssetLens akan melakukan passive inspection terhadap halaman dan menghasilkan:

- Images
- SVG
- CSS
- JavaScript
- Fonts
- Icons
- Videos
- Audio
- Metadata
- Open Graph
- Twitter Cards
- Color palette
- Technology detection

MVP tidak menjalankan JavaScript pada website target dan tidak melakukan crawling ke seluruh website.

---

# 2. Problem Statement

Developer dan designer sering perlu mengetahui resource yang digunakan sebuah website.

Contohnya:

- mencari URL gambar tertentu;
- mengetahui favicon;
- mencari stylesheet;
- mengetahui font;
- melihat Open Graph metadata;
- mengetahui framework yang digunakan;
- melihat warna yang digunakan;
- memeriksa asset tanpa membuka DevTools secara manual.

Browser DevTools sebenarnya dapat melakukan sebagian besar pekerjaan tersebut, tetapi prosesnya membutuhkan beberapa langkah dan tidak praktis untuk inspeksi cepat.

AssetLens menggabungkan informasi tersebut dalam satu interface.

---

# 3. Goals

## Primary Goals

1. Membuat website scanner yang mudah digunakan.
2. User hanya perlu memasukkan URL.
3. Menampilkan asset website secara terstruktur.
4. Menampilkan metadata website.
5. Mendeteksi teknologi yang digunakan secara heuristik.
6. Menampilkan color palette.
7. Menyediakan export hasil scan.
8. Tidak membutuhkan API AI berbayar.
9. Tidak membutuhkan database untuk MVP.
10. Dapat di-deploy dengan biaya awal Rp0.

## Secondary Goals

- Menjadi developer portfolio project.
- Dapat dikembangkan menjadi API.
- Dapat dikembangkan menjadi CLI.
- Dapat dikembangkan menjadi browser extension.
- Memiliki kemungkinan monetisasi pada tahap berikutnya.

---

# 4. Non-Goals

MVP tidak akan:

- melakukan penetration testing;
- melakukan vulnerability scanning;
- melakukan crawling seluruh website;
- melakukan brute force;
- menjalankan JavaScript target;
- bypass authentication;
- bypass Cloudflare atau anti-bot;
- mengambil konten private;
- melakukan credential extraction;
- menyimpan `.env` atau secret;
- melakukan scraping massal.

AssetLens adalah **website inspection tool**, bukan security scanner.

---

# 5. Target Users

## 5.1 Web Developer

Kebutuhan:

- mencari asset;
- melihat framework;
- mencari stylesheet;
- melihat metadata;
- memeriksa struktur resource.

## 5.2 Frontend Learner

Kebutuhan:

- mempelajari bagaimana website dibangun;
- melihat asset yang digunakan;
- mengetahui framework/CSS library.

## 5.3 UI/UX Designer

Kebutuhan:

- mencari font;
- melihat warna;
- menemukan image/icon;
- melihat metadata visual.

## 5.4 Web Researcher

Kebutuhan:

- melakukan inspeksi cepat;
- mengumpulkan informasi teknis publik.

---

# 6. User Flow

```text
User
  │
  ▼
Homepage
  │
  ▼
Enter URL
  │
  ▼
Validate URL
  │
  ▼
Security / SSRF Check
  │
  ▼
Fetch Website
  │
  ▼
Parse HTML
  │
  ├── Assets
  ├── Metadata
  ├── Colors
  ├── Fonts
  └── Technologies
  │
  ▼
Generate ScanResult
  │
  ▼
Results Dashboard
  │
  ├── Overview
  ├── Images
  ├── CSS
  ├── JavaScript
  ├── Fonts
  ├── Metadata
  ├── Technologies
  └── Export
```

---

# 7. Functional Requirements

## FR-001 URL Input

Homepage harus memiliki input URL.

Contoh:

```text
https://example.com
```

Tombol:

```text
Scan Website
```

Input harus:

- menerima `http://`;
- menerima `https://`;
- menolak URL invalid;
- menolak protocol selain HTTP/HTTPS.

---

# 8. FR-002 URL Validation

URL harus divalidasi sebelum request dilakukan.

Contoh valid:

```text
https://example.com
http://example.com
https://www.example.com/page
```

Contoh invalid:

```text
example
javascript:alert(1)
file:///etc/passwd
ftp://example.com
```

---

# 9. FR-003 SSRF Protection

Karena backend melakukan HTTP request berdasarkan input user, SSRF protection adalah requirement wajib.

Server harus menolak:

```text
localhost
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
169.254.0.0/16
::1
fc00::/7
```

Termasuk private/internal address lainnya.

DNS resolution harus diperiksa sebelum request.

Redirect juga harus divalidasi.

Contoh:

```text
example.com
    ↓ redirect
127.0.0.1
```

Redirect tersebut harus ditolak.

---

# 10. FR-004 Website Fetcher

Backend harus melakukan HTTP request ke URL target.

Requirement:

- HTTP GET;
- timeout;
- response size limit;
- redirect limit;
- content-type validation;
- descriptive User-Agent.

Contoh User-Agent:

```text
AssetLensBot/1.0
```

Default timeout:

```text
10 seconds
```

Default HTML response limit:

```text
5 MB
```

---

# 11. FR-005 HTML Parsing

HTML harus diproses menggunakan parser.

Library utama:

```text
cheerio
```

Parser harus mencari:

```html
<img>
<script>
<link>
<video>
<audio>
<source>
```

serta:

```html
<meta>
<style>
```

---

# 12. FR-006 Image Detection

AssetLens harus mendeteksi image dari:

```html
<img src="">
<img srcset="">
<meta property="og:image">
<link rel="icon">
```

Format yang dapat ditemukan:

```text
PNG
JPG/JPEG
WEBP
GIF
SVG
AVIF
ICO
```

Informasi:

```text
URL
Filename
MIME type
Width
Height
Alt text
Source
```

Jika dimension tidak tersedia dari HTML, width/height dapat bernilai `null`.

---

# 13. FR-007 Stylesheet Detection

Deteksi:

```html
<link rel="stylesheet" href="">
```

dan stylesheet yang ditemukan dari HTML.

Data:

```text
URL
Filename
Type
```

MVP tidak wajib melakukan parsing seluruh CSS external.

---

# 14. FR-008 JavaScript Detection

Deteksi:

```html
<script src="">
```

Data:

```text
URL
Filename
Type
```

Inline JavaScript tidak perlu ditampilkan sebagai asset pada MVP.

---

# 15. FR-009 Font Detection

Font dapat dideteksi dari:

- CSS;
- `<link>`;
- `@font-face`.

Contoh:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2");
}
```

Output:

```text
Inter
  └── /fonts/inter.woff2
```

Format umum:

```text
WOFF
WOFF2
TTF
OTF
```

---

# 16. FR-010 Icon Detection

Deteksi:

```html
<link rel="icon">
<link rel="shortcut icon">
<link rel="apple-touch-icon">
```

Output:

```text
Favicon
Apple Touch Icon
Other Icons
```

---

# 17. FR-011 Video & Audio Detection

Deteksi:

```html
<video>
<audio>
<source>
```

Data:

```text
URL
Type
MIME
```

---

# 18. FR-012 Metadata Detection

Deteksi:

```text
<title>
<meta name="description">
<link rel="canonical">
```

Output:

```text
Title
Description
Canonical URL
```

---

# 19. FR-013 Open Graph Detection

Deteksi:

```text
og:title
og:description
og:image
og:url
og:type
og:site_name
```

Output:

```text
Open Graph

Title
Description
Image
URL
Type
Site Name
```

---

# 20. FR-014 Twitter Card Detection

Deteksi:

```text
twitter:card
twitter:title
twitter:description
twitter:image
twitter:site
```

---

# 21. FR-015 Color Extraction

AssetLens harus mencoba mengekstrak warna dari:

- inline CSS;
- `<style>`;
- CSS yang dapat di-fetch.

Format:

```text
#FFFFFF
#000000
rgb(...)
rgba(...)
hsl(...)
```

Output harus dinormalisasi jika memungkinkan menjadi HEX.

Contoh:

```text
Color Palette

#0F172A
#FFFFFF
#3B82F6
#64748B
```

MVP tidak wajib melakukan image color extraction.

---

# 22. FR-016 Technology Detection

Technology detection bersifat **heuristic**.

Contoh teknologi:

```text
Next.js
React
Vue
Svelte
Nuxt
Angular
Tailwind CSS
Bootstrap
WordPress
Vercel
Cloudflare
Google Analytics
```

Detection dapat menggunakan indicator seperti:

```text
HTML attributes
Script URLs
CSS URLs
Meta tags
Generator tags
Known framework patterns
```

Output:

```text
Technologies

Framework
✓ Next.js
✓ React

CSS
✓ Tailwind CSS

Analytics
✓ Google Analytics
```

Technology detection tidak boleh diklaim sebagai 100% akurat.

---

# 23. FR-017 Asset Categorization

Semua asset harus dikategorikan:

```text
images
svg
stylesheets
scripts
fonts
icons
videos
audio
```

Asset duplicate berdasarkan URL harus dihapus.

---

# 24. FR-018 Result Dashboard

Result page harus menampilkan summary:

```text
Images       42
SVG           8
JavaScript   14
CSS           6
Fonts         4
Videos        2
```

---

# 25. FR-019 Asset Explorer

User dapat melihat daftar asset.

Kolom:

```text
Name
Type
URL
MIME
Size
Dimensions
```

Fitur:

```text
Search
Filter
Copy URL
Open Asset
```

---

# 26. FR-020 Image Grid

Image asset harus dapat ditampilkan dalam grid.

Contoh:

```text
┌──────────┐ ┌──────────┐ ┌──────────┐
│          │ │          │ │          │
│  IMAGE   │ │  IMAGE   │ │  IMAGE   │
│          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘

hero.webp
logo.svg
banner.jpg
```

Image yang gagal dimuat tidak boleh menyebabkan seluruh page error.

---

# 27. FR-021 Export

User dapat melakukan export hasil scan.

Format MVP:

```text
JSON
CSV
TXT
```

JSON harus mempertahankan struktur lengkap `ScanResult`.

---

# 28. FR-022 Scan Status

UI harus menampilkan status:

```text
Validating URL...
Connecting...
Fetching HTML...
Parsing assets...
Analyzing metadata...
Detecting technologies...
Complete
```

Jika gagal:

```text
Scan failed
```

dengan error message yang mudah dipahami.

---

# 29. FR-023 Error Handling

Error harus menggunakan kode internal.

Contoh:

```text
INVALID_URL
BLOCKED_URL
SSRF_BLOCKED
FETCH_FAILED
TIMEOUT
RESPONSE_TOO_LARGE
INVALID_CONTENT_TYPE
PARSING_FAILED
UNKNOWN_ERROR
```

Jangan menampilkan stack trace kepada user.

---

# 30. API Specification

Endpoint:

```text
POST /api/scan
```

Request:

```json
{
  "url": "https://example.com"
}
```

Success:

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "finalUrl": "https://example.com/",
    "title": "Example Domain",
    "metadata": {},
    "assets": {},
    "colors": [],
    "technologies": [],
    "scannedAt": "2026-09-15T00:00:00.000Z"
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "FETCH_FAILED",
    "message": "Unable to fetch the website."
  }
}
```

---

# 31. TypeScript Data Model

```ts
interface ScanResult {
  url: string;
  finalUrl: string;
  title: string | null;

  metadata: {
    description: string | null;
    canonical: string | null;
    openGraph: Record<string, string>;
    twitter: Record<string, string>;
  };

  assets: {
    images: Asset[];
    svg: Asset[];
    stylesheets: Asset[];
    scripts: Asset[];
    fonts: Asset[];
    icons: Asset[];
    videos: Asset[];
    audio: Asset[];
  };

  colors: string[];

  technologies: Technology[];

  scannedAt: string;
}

interface Asset {
  url: string;
  type: string;
  name: string;
  mimeType?: string;
  size?: number | null;
  width?: number | null;
  height?: number | null;
}

interface Technology {
  name: string;
  category: string;
  confidence: number;
}
```

---

# 32. Frontend Architecture

Framework:

```text
Next.js
```

Language:

```text
TypeScript
```

Styling:

```text
Tailwind CSS
```

Icons:

```text
Lucide
```

Components:

```text
components/
├── scanner/
│   ├── UrlInput
│   ├── ScanProgress
│   ├── ResultHeader
│   ├── AssetStats
│   ├── AssetTable
│   ├── ImageGrid
│   ├── MetadataCard
│   ├── TechStack
│   ├── ColorPalette
│   └── ExportMenu
│
└── ui/
    ├── Button
    ├── Card
    ├── Input
    └── Badge
```

---

# 33. Backend Architecture

```text
app/api/scan/route.ts
        │
        ▼
security/url.ts
        │
        ▼
security/ssrf.ts
        │
        ▼
scanner/fetcher.ts
        │
        ▼
scanner/parser.ts
        │
        ├── assets.ts
        ├── metadata.ts
        ├── fonts.ts
        ├── colors.ts
        └── technologies.ts
        │
        ▼
ScanResult
```

Scanner modules harus dibuat terpisah agar mudah dites dan dikembangkan.

---

# 34. Project Structure

```text
assetlens/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── scan/
│   │   └── page.tsx
│   │
│   └── api/
│       └── scan/
│           └── route.ts
│
├── components/
│   ├── scanner/
│   │   ├── UrlInput.tsx
│   │   ├── ScanProgress.tsx
│   │   ├── ResultHeader.tsx
│   │   ├── AssetStats.tsx
│   │   ├── AssetTable.tsx
│   │   ├── ImageGrid.tsx
│   │   ├── MetadataCard.tsx
│   │   ├── TechStack.tsx
│   │   ├── ColorPalette.tsx
│   │   └── ExportMenu.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Badge.tsx
│
├── lib/
│   ├── scanner/
│   │   ├── fetcher.ts
│   │   ├── parser.ts
│   │   ├── assets.ts
│   │   ├── metadata.ts
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── technologies.ts
│   │
│   ├── security/
│   │   ├── url.ts
│   │   └── ssrf.ts
│   │
│   └── export/
│       ├── json.ts
│       ├── csv.ts
│       └── txt.ts
│
├── types/
│   └── scanner.ts
│
├── public/
│
├── tests/
│   ├── scanner/
│   └── security/
│
├── .env.example
├── .gitignore
├── README.md
├── PRD.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

# 35. Security Requirements

Security merupakan prioritas utama karena server melakukan outbound requests.

## SSRF

Harus mencegah akses terhadap:

- localhost;
- loopback;
- private IPv4;
- private IPv6;
- link-local;
- cloud metadata endpoints;
- internal hostnames.

## Redirect

Setiap redirect harus divalidasi kembali.

## Protocol

Hanya:

```text
http
https
```

## Timeout

Maximum:

```text
10 seconds
```

## Response Limit

Maximum:

```text
5 MB
```

## Redirect Limit

Maximum:

```text
5 redirects
```

## Rate Limiting

MVP:

```text
10 scans / IP / hour
```

Nilai dapat disesuaikan berdasarkan traffic.

---

# 36. Privacy

AssetLens tidak perlu menyimpan website hasil scan pada MVP.

Default architecture:

```text
Request
 ↓
Scan
 ↓
Return result
 ↓
Discard result
```

Tidak menyimpan:

- HTML target;
- cookies;
- authorization headers;
- website credentials;
- `.env`;
- user secrets.

User hanya mengirim URL.

---

# 37. Database

MVP:

```text
NO DATABASE
```

Alasan:

- mengurangi biaya;
- mengurangi complexity;
- tidak membutuhkan persistence;
- mempercepat development.

Database baru diperlukan jika fitur berikut dibuat:

```text
Accounts
Scan History
Saved Projects
Usage Analytics
Billing
API Keys
```

---

# 38. Environment Variables

MVP idealnya tidak membutuhkan secret.

`.env.example`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Jika analytics/rate-limit provider ditambahkan kemudian, environment variable dapat ditambahkan.

Jangan pernah memasukkan API key ke client-side bundle.

---

# 39. UI Design

Style:

```text
Developer Tool
Minimal
Dense but readable
Professional
Fast
```

Hindari:

- excessive gradients;
- excessive animations;
- generic AI SaaS appearance;
- terlalu banyak rounded cards;
- landing page yang terlalu panjang.

### Homepage

```text
AssetLens

Inspect the assets behind any website.

[ https://example.com                    ]
                              [ Scan ]

No account required.
```

### Result

```text
example.com

42 Images
14 Scripts
6 Stylesheets
4 Fonts

[Overview] [Images] [CSS] [JS] [Fonts] [Metadata]
```

---

# 40. Performance Requirements

Target:

```text
Initial page load < 2s
```

Scanner target:

```text
Simple website < 5s
```

Maximum scanner execution:

```text
10s
```

Frontend harus tidak freeze ketika scan sedang berlangsung.

Image preview harus menggunakan lazy loading.

---

# 41. Accessibility

Requirement:

- semantic HTML;
- keyboard navigation;
- visible focus state;
- accessible button labels;
- sufficient contrast;
- alt text pada UI images;
- error message tidak hanya menggunakan warna.

---

# 42. SEO

Homepage harus memiliki:

```text
Title:
AssetLens — Website Asset & Technology Inspector

Description:
Inspect website assets, metadata, colors, fonts, and technologies from a single URL.
```

Target keywords:

```text
website asset finder
website asset scanner
website technology detector
website inspector
website analyzer
```

SEO bukan prioritas sebelum scanner stabil.

---

# 43. Testing

## Unit Tests

Test:

```text
URL validation
SSRF protection
Asset extraction
Metadata extraction
Color extraction
Technology detection
```

## Security Tests

Test:

```text
localhost
127.0.0.1
private IP
IPv6 loopback
metadata endpoint
redirect to private IP
invalid protocol
```

## Integration Tests

Test:

```text
POST /api/scan
```

dengan website test.

---

# 44. MVP Acceptance Criteria

MVP dianggap selesai apabila:

- [ ] User dapat memasukkan URL.
- [ ] URL invalid ditolak.
- [ ] SSRF protection aktif.
- [ ] Website dapat di-fetch.
- [ ] HTML berhasil diparse.
- [ ] Images terdeteksi.
- [ ] SVG terdeteksi.
- [ ] CSS terdeteksi.
- [ ] JavaScript terdeteksi.
- [ ] Fonts dapat dideteksi jika tersedia.
- [ ] Favicon terdeteksi.
- [ ] Metadata terdeteksi.
- [ ] Open Graph terdeteksi.
- [ ] Twitter Card terdeteksi.
- [ ] Color palette ditampilkan.
- [ ] Technology detection berjalan.
- [ ] Duplicate asset dihapus.
- [ ] Search/filter tersedia.
- [ ] JSON export tersedia.
- [ ] CSV export tersedia.
- [ ] Error handling tersedia.
- [ ] Timeout tersedia.
- [ ] Response size limit tersedia.
- [ ] Rate limiting tersedia.
- [ ] Mobile responsive.
- [ ] Production build berhasil.
- [ ] Deployment berhasil.

---

# 45. Development Phases

## Phase 1 — Project Setup

```text
[ ] Initialize Next.js
[ ] Configure TypeScript
[ ] Configure Tailwind
[ ] Create layout
[ ] Create homepage
[ ] Create URL input
```

## Phase 2 — Scanner Core

```text
[ ] URL validation
[ ] SSRF protection
[ ] HTTP fetcher
[ ] Timeout
[ ] Response limit
[ ] Redirect handling
[ ] HTML parser
```

## Phase 3 — Asset Detection

```text
[ ] Images
[ ] SVG
[ ] CSS
[ ] JavaScript
[ ] Fonts
[ ] Icons
[ ] Videos
[ ] Audio
```

## Phase 4 — Analysis

```text
[ ] Metadata
[ ] Open Graph
[ ] Twitter Cards
[ ] Colors
[ ] Technologies
```

## Phase 5 — UI

```text
[ ] Result dashboard
[ ] Asset statistics
[ ] Asset table
[ ] Image grid
[ ] Metadata cards
[ ] Technology badges
[ ] Color palette
[ ] Search
[ ] Filter
```

## Phase 6 — Export

```text
[ ] JSON
[ ] CSV
[ ] TXT
```

## Phase 7 — Security

```text
[ ] SSRF tests
[ ] Rate limiting
[ ] Request timeout
[ ] Response limit
[ ] Redirect validation
[ ] Error sanitization
```

## Phase 8 — Production

```text
[ ] SEO
[ ] Accessibility
[ ] Mobile testing
[ ] Production build
[ ] Deployment
[ ] Monitoring
```

---

# 46. Deployment

Initial architecture:

```text
GitHub
   │
   ▼
Vercel
   │
   ├── Next.js Frontend
   └── Next.js API
```

Database:

```text
None
```

External paid API:

```text
None
```

AI API:

```text
None
```

Initial deployment target:

```text
Rp0
```

Free-tier limitations must be monitored as traffic grows.

---

# 47. V1 Features

Setelah MVP stabil:

```text
[ ] Scan history
[ ] User accounts
[ ] Saved scans
[ ] Better technology detection
[ ] CSS asset analysis
[ ] Image dimension detection
[ ] Asset download
[ ] Screenshot
[ ] Website comparison
[ ] Bulk URL scanning
```

---

# 48. V2 Features

```text
[ ] Dynamic JavaScript scanning
[ ] Playwright-based browser scan
[ ] Network request inspection
[ ] JavaScript-generated assets
[ ] Screenshot analysis
[ ] Performance information
```

Dynamic scanning harus dipisahkan dari static scanner karena kebutuhan CPU, RAM, timeout, dan security jauh lebih tinggi.

---

# 49. Developer API

Future API:

```text
POST /api/v1/scan
```

Example:

```bash
curl -X POST https://assetlens.example/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

API access dapat menjadi fitur Pro.

---

# 50. CLI

Future CLI:

```bash
assetlens https://example.com
```

Output:

```text
AssetLens

URL: https://example.com

Assets
────────────────
Images       42
SVG           8
CSS           6
JavaScript   14
Fonts         4

Technologies
────────────────
✓ React
✓ Next.js
✓ Tailwind CSS

Metadata
────────────────
Title: Example
Description: Example website
```

---

# 51. Monetization

Monetization bukan bagian dari MVP.

Future model:

## Free

```text
10 scans/day
Basic analysis
Metadata
Assets
Technology detection
```

## Pro

```text
Unlimited scans
Dynamic scan
Bulk scan
Export
Screenshot
Historical scan
API
CLI
```

---

# 52. Product Principles

### Principle 1 — Fast

User harus mendapatkan hasil secepat mungkin.

### Principle 2 — Transparent

Jika detection bersifat heuristic, tampilkan sebagai heuristic.

### Principle 3 — Privacy First

Jangan menyimpan data website jika tidak diperlukan.

### Principle 4 — Secure by Default

Semua URL dianggap untrusted input.

### Principle 5 — No Unnecessary Infrastructure

MVP tidak menggunakan database, queue, AI API, atau service berbayar jika tidak diperlukan.

### Principle 6 — Progressive Complexity

Mulai dari static HTML.

Dynamic browser scanning hanya ditambahkan setelah MVP tervalidasi.

---

# 53. Definition of Done

Feature dianggap selesai jika:

1. Berfungsi pada development environment.
2. Memiliki error handling.
3. Memiliki security consideration.
4. Tidak menyebabkan TypeScript error.
5. Lulus lint.
6. Lulus test terkait.
7. Tidak merusak feature existing.
8. Responsive.
9. Tidak membocorkan secret.
10. Production build berhasil.

---

# 54. Final MVP Architecture

```text
                         ┌───────────────┐
                         │     User      │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Next.js UI    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ /api/scan     │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────┐
                         │ URL Security  │
                         │ SSRF Defense  │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────┐
                         │ HTTP Fetcher  │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────┐
                         │ HTML Parser   │
                         └───────┬───────┘
                                 │
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼
          Asset Parser      Metadata Parser    Tech Detector
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 ▼
                         ┌───────────────┐
                         │  ScanResult   │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Result UI     │
                         └───────────────┘
```

---

# 55. Recommended Build Order

Urutan implementasi yang harus diikuti:

```text
1. Project setup
2. Homepage
3. URL validation
4. SSRF protection
5. HTTP fetcher
6. HTML parser
7. Image extraction
8. CSS extraction
9. JS extraction
10. Font extraction
11. Icon extraction
12. Metadata extraction
13. Open Graph
14. Twitter Cards
15. Color extraction
16. Technology detection
17. ScanResult type
18. Result dashboard
19. Asset table
20. Image grid
21. Search/filter
22. Export
23. Rate limiting
24. Security testing
25. Responsive testing
26. SEO
27. Production build
28. Deploy
```

**MVP selesai pada tahap 28.**

Jangan implementasikan database, authentication, payment, AI, crawler, atau Playwright sebelum MVP ini benar-benar bekerja dan mendapatkan penggunaan nyata.