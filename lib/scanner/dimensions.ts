import sizeOf from "image-size";
import type { Asset } from "@/types/scanner";

/**
 * Populate image dimensions from already-downloaded image bytes.
 * Returns null dimensions when the format cannot be identified.
 */
export function detectImageDimensions(
  asset: Asset,
  bytes: Uint8Array,
): Asset {
  try {
    const result = sizeOf(bytes);
    return {
      ...asset,
      width: result.width ?? null,
      height: result.height ?? null,
    };
  } catch {
    return asset;
  }
}

export function isImageAsset(asset: Asset): boolean {
  return (
    asset.type === "image" ||
    asset.mimeType?.startsWith("image/") === true
  );
}