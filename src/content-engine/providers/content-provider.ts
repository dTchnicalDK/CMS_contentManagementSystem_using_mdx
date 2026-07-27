import type {
  Content,
  ContentVariant,
  Locale,
  SyllabusNodeRef,
} from "../domain/content";

export interface ContentProvider {
  getById(contentId: string, locale: Locale): Promise<ContentVariant | null>;

  getContentById(contentId: string): Promise<Content | null>;

  getBySyllabusRef(ref: SyllabusNodeRef): Promise<Content[]>;
}
