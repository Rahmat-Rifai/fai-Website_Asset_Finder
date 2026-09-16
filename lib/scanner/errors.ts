export const ScanErrorCode = {
  INVALID_URL: "INVALID_URL",
  BLOCKED_URL: "BLOCKED_URL",
  SSRF_BLOCKED: "SSRF_BLOCKED",
  FETCH_FAILED: "FETCH_FAILED",
  TIMEOUT: "TIMEOUT",
  RESPONSE_TOO_LARGE: "RESPONSE_TOO_LARGE",
  INVALID_CONTENT_TYPE: "INVALID_CONTENT_TYPE",
  PARSING_FAILED: "PARSING_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ScanErrorCodeType =
  (typeof ScanErrorCode)[keyof typeof ScanErrorCode];

const FRIENDLY: Record<ScanErrorCodeType, string> = {
  INVALID_URL: "The URL provided is not valid.",
  BLOCKED_URL: "This URL is not allowed.",
  SSRF_BLOCKED: "Access to that address is blocked for security.",
  FETCH_FAILED: "Unable to fetch the website.",
  TIMEOUT: "The website took too long to respond.",
  RESPONSE_TOO_LARGE: "The website response was too large to analyze.",
  INVALID_CONTENT_TYPE: "The URL did not return an HTML page.",
  PARSING_FAILED: "Unable to parse the website content.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
};

export class ScanError extends Error {
  code: ScanErrorCodeType;
  constructor(code: ScanErrorCodeType, message?: string) {
    super(message ?? FRIENDLY[code]);
    this.code = code;
    this.name = "ScanError";
  }
}

export function toScanError(err: unknown): ScanError {
  if (err instanceof ScanError) return err;

  console.error("Unexpected scan error:", err);
  return new ScanError("UNKNOWN_ERROR");
}
