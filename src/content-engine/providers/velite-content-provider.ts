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

  private buildIndexes(): void {
    this.buildContentIndex();
    this.buildVariantIndex();
    this.buildSyllabusIndex();
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
}
