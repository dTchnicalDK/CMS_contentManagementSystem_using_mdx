import type { Content, Locale, SyllabusNodeRef } from "../../domain/content";
import { toContentVariant } from "./to-content-variant";
import type { VeliteContentDocument } from "./types";

export function toContents(documents: VeliteContentDocument[]): Content[] {
  const contentMap = new Map<string, Content>();

  for (const document of documents) {
    const variant = toContentVariant(document);

    const existingContent = contentMap.get(document.contentId);

    if (existingContent) {
      existingContent.variants[document.locale] = variant;
      continue;
    }

    const content: Content = {
      contentId: document.contentId,
      syllabusRefs: document.syllabusRefs,

      variants: {
        [document.locale]: variant,
      },
    };

    contentMap.set(document.contentId, content);
  }

  return Array.from(contentMap.values());
}
