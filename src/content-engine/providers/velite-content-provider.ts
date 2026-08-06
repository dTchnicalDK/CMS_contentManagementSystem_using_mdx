import type {
  ContentVariant,
  Locale,
  SyllabusNodeRef,
  Content,
} from "../domain/content";
// import { toContentVariant } from "../adapters/velite/to-content-variant";
import { toContents } from "../adapters/velite/to-content";
import { ContentProvider } from "./content-provider";
import { contents } from "@/.velite";

export class VeliteContentProvider implements ContentProvider {
  private readonly contents: Content[];

  private readonly contentIndex = new Map<string, Content>();

  private readonly variantIndex = new Map<string, ContentVariant>();

  private readonly syllabusIndex = new Map<string, Content[]>();

  private readonly examIndex = new Map<string, Content[]>();

  private buildIndexes(): void {
    this.buildContentIndex();
    this.buildVariantIndex();
    this.buildSyllabusIndex();
    this.buildExamIndex();
  }

  constructor() {
    this.contents = toContents(contents);
    this.buildIndexes();
  }
  //private helper methods
  private getVariantKey(contentId: string, locale: Locale): string {
    return `${contentId}::${locale}`;
  }

  private getSyllabusKey(ref: SyllabusNodeRef): string {
    return `${ref.exam}::${ref.path}`;
  }

  // build content index
  private buildContentIndex(): void {
    for (const content of this.contents) {
      this.contentIndex.set(content.contentId, content);
    }
  }
  // Build the Variant Index
  private buildVariantIndex(): void {
    for (const content of this.contents) {
      const variants = Object.values(content.variants).filter(
        (variant): variant is ContentVariant => variant !== undefined,
      );

      for (const variant of variants) {
        this.variantIndex.set(
          this.getVariantKey(variant.contentId, variant.locale),
          variant,
        );
      }
    }
  }
  //build exam index (for related-content lookups)
  private buildExamIndex(): void {
    for (const content of this.contents) {
      const exams = new Set(content.syllabusRefs.map((ref) => ref.exam));

      for (const exam of exams) {
        const existing = this.examIndex.get(exam);

        if (existing) {
          existing.push(content);
        } else {
          this.examIndex.set(exam, [content]);
        }
      }
    }
  }

  private getParentPath(path: string): string {
    const segments = path.split("/");
    return segments.slice(0, -1).join("/");
  }

  //build syllabus index
  private buildSyllabusIndex(): void {
    for (const content of this.contents) {
      for (const ref of content.syllabusRefs) {
        const key = this.getSyllabusKey(ref);

        const existing = this.syllabusIndex.get(key);

        if (existing) {
          existing.push(content);
        } else {
          this.syllabusIndex.set(key, [content]);
        }
      }
    }
  }

  async getById(
    contentId: string,
    locale: Locale,
  ): Promise<ContentVariant | null> {
    const key = this.getVariantKey(contentId, locale);

    return this.variantIndex.get(key) ?? null;
  }

  async getContentById(contentId: string): Promise<Content | null> {
    return this.contentIndex.get(contentId) ?? null;
  }

  async getBySyllabusRef(ref: SyllabusNodeRef): Promise<Content[]> {
    const key = this.getSyllabusKey(ref);

    return this.syllabusIndex.get(key) ?? [];
  }

  async getRelated(
    ref: SyllabusNodeRef,
    excludeContentId: string,
    limit = 5,
  ): Promise<Content[]> {
    const sameExam = this.examIndex.get(ref.exam) ?? [];
    const parentPath = this.getParentPath(ref.path);

    const related = sameExam.filter((content) => {
      if (content.contentId === excludeContentId) return false;

      return content.syllabusRefs.some(
        (r) => r.exam === ref.exam && this.getParentPath(r.path) === parentPath,
      );
    });

    return related.slice(0, limit);
  }
}
