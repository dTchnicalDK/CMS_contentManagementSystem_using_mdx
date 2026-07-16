import type { ContentVariant } from "../../domain/content";
import type { Locale } from "../../domain/content";

type VeliteContentDocument = {
  contentId: string;
  title: string;
  body: string;
  locale: Locale;
};

export function toContentVariant(
  document: VeliteContentDocument,
): ContentVariant {
  return {
    contentId: document.contentId,
    title: document.title,
    locale: document.locale,

    body: {
      format: "compiled-mdx",
      value: document.body,
    },
  };
}
