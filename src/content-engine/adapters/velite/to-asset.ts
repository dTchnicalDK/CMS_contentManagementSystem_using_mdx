import type { Asset } from "../../domain/asset";
import type { VeliteAssetDocument } from "./types";

export function toAssets(documents: VeliteAssetDocument[]): Asset[] {
  return documents.map((document) => ({
    assetId: document.assetId,
    type: document.type,
    title: document.title,
    description: document.description,
    origin: document.origin,
    resourceKey: document.resourceKey,
    metadata: document.metadata,
  }));
}
