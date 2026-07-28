import { notFound } from "next/navigation";
import { lessonAssembler } from "@/src/content-engine/container";
import { LessonView } from "@/src/content-engine/lesson-view";
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

  return <LessonView lesson={lesson} variant={variant} />;
}
