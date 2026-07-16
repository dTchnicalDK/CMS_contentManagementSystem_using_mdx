import type {
  ContentVariant,
  Locale,
  SyllabusNodeRef,
  Content,
} from "../domain/content";
import { toContentVariant } from "../adapters/velite/to-content-variant";
import { toContents } from "../adapters/velite/to-content";
import { ContentProvider } from "./content-provider";

type VeliteDocument = {
  contentId: string;
  title: string;
  body: string;
  locale: Locale;
  syllabusRefs: SyllabusNodeRef[];
};

export class VeliteContentProvider implements ContentProvider {
  private readonly contents: Content[];

  constructor(private readonly documents: VeliteDocument[]) {
    this.contents = toContents(documents);
  }

  async getById(
    contentId: string,
    locale: Locale,
  ): Promise<ContentVariant | null> {
    const document = this.documents.find(
      (item) => item.contentId === contentId && item.locale === locale,
    );

    if (!document) {
      return null;
    }

    return toContentVariant(document);
  }

  async getContentById(contentId: string): Promise<Content | null> {
    return this.contents.find((item) => item.contentId === contentId) ?? null;
  }
}
