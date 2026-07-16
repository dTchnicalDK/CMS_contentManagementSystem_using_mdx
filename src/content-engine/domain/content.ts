export type Locale = "en" | "hi";

export type ContentBody = {
  format: "compiled-mdx";
  value: string;
};

export type ContentVariant = {
  contentId: string;
  locale: Locale;
  title: string;
  body: ContentBody;
};

export type SyllabusNodeRef = {
  exam: string;
  path: string;
};

export type Content = {
  contentId: string;

  syllabusRefs: SyllabusNodeRef[];

  variants: Partial<Record<Locale, ContentVariant>>;
};
