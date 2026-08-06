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

  /**
   * Other content sharing the same exam and parent syllabus path
   * (e.g. other topics under history/ancient-india/...), excluding the
   * given contentId. Not the same as getBySyllabusRef, which matches
   * an exact {exam, path} pair — each lesson's own path is unique, so
   * an exact match would only ever return the lesson itself.
   */
  getRelated(
    ref: SyllabusNodeRef,
    excludeContentId: string,
    limit?: number,
  ): Promise<Content[]>;
}
