export interface Asset {
  url: string;
  type: string;
  name: string;
  mimeType?: string;
  size?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface Technology {
  name: string;
  category: string;
  confidence: number;
}

export interface Metadata {
  title: string | null;
  description: string | null;
  canonical: string | null;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
}

export interface BulkScanResult {
  url: string;
  success: boolean;
  data?: ScanResult;
  error?: { code: string; message: string };
}

export interface ScanResult {
  url: string;
  finalUrl: string;
  title: string | null;
  metadata: Metadata;
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
