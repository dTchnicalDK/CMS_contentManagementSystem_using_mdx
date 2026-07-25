import { AssetReference } from "../../domain/asset";
import type { Locale, SyllabusNodeRef } from "../../domain/content";

export type VeliteContentDocument = {
  contentId: string;
  title: string;
  body: string;
  locale: Locale;
  syllabusRefs: SyllabusNodeRef[];
  // assetRefs: AssetReference[];
};
