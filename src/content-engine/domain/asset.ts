export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "timeline"
  | "concept-map"
  | "diagram";

export type AssetOrigin =
  | "manual"
  | "ai-generated"
  | "ai-assisted"
  | "imported";

export type AssetMetadata = {
  alt?: string;
  source?: string;
  author?: string;
  license?: string;
  tags?: string[];
};

export type Asset = {
  assetId: string;

  type: AssetType;

  title: string;

  description?: string;

  origin: AssetOrigin;

  /**
   * Logical provider key.
   *
   * Filesystem:
   *   history/harappa/city-map
   *
   * Cloudinary:
   *   history/harappa/city-map
   *
   * S3:
   *   history/harappa/city-map
   */
  resourceKey: string;

  metadata: AssetMetadata;
};

export type AssetReference = {
  assetId: string;

  order: number;

  caption?: string;
};
