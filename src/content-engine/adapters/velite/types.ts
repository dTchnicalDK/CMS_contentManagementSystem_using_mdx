import { AssetReference } from "../../domain/asset";
import type { AssetType, AssetOrigin, AssetMetadata } from "../../domain/asset";
import type { Locale, SyllabusNodeRef } from "../../domain/content";

export type VeliteContentDocument = {
  contentId: string;
  title: string;
  body: string;
  locale: Locale;
  syllabusRefs: SyllabusNodeRef[];
  assetRefs: AssetReference[];
};

export type VeliteAssetDocument = {
  assetId: string;
  type: AssetType;
  title: string;
  description?: string;
  origin: AssetOrigin;
  file: string;
  resourceKey: string;
  metadata: AssetMetadata;
};
