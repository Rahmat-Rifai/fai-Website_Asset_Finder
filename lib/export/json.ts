import type { ScanResult } from "@/types/scanner";

export function toJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
