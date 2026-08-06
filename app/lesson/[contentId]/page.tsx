import { notFound } from "next/navigation";
import {
  lessonAssembler,
  contentProvider,
} from "@/src/content-engine/container";
// import { LessonView } from "@/src/content-engine/lesson-view";
import { LessonView } from "@/src/content-engine/ui/lesson-view";
import type { Locale } from "@/src/content-engine/domain/content";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ contentId: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const { contentId } = await params;
  const { locale } = await searchParams;

  const lesson = await lessonAssembler.getLesson(contentId);

  if (!lesson) {
    notFound();
  }

  const activeLocale = (locale ?? "en") as Locale;
  const variant = lesson.content.variants[activeLocale];

  if (!variant) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-foreground">
        <p>
          No &quot;{activeLocale}&quot; variant exists for this content. Try{" "}
          {Object.keys(lesson.content.variants).join(", ")}.
        </p>
      </main>
    );
  }

  // Related content is looked up per syllabusRef and de-duplicated, since
  // a lesson can carry more than one syllabus reference.
  const relatedByContentId = new Map<
    string,
    { contentId: string; title: string }
  >();

  for (const ref of lesson.content.syllabusRefs) {
    const related = await contentProvider.getRelated(ref, contentId);

    for (const content of related) {
      if (relatedByContentId.has(content.contentId)) continue;

      const relatedVariant =
        content.variants[activeLocale] ?? Object.values(content.variants)[0];

      relatedByContentId.set(content.contentId, {
        contentId: content.contentId,
        title: relatedVariant?.title ?? content.contentId,
      });
    }
  }

  return (
    <LessonView
      lesson={lesson}
      variant={variant}
      related={[...relatedByContentId.values()]}
    />
  );
}
