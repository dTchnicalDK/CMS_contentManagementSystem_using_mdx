import type { Content, ContentVariant, Locale } from "../domain/content";

export interface ContentProvider {
  getById(contentId: string, locale: Locale): Promise<ContentVariant | null>;

  getContentById(contentId: string): Promise<Content | null>;
}
