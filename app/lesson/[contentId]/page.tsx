import { notFound } from "next/navigation";
import { lessonAssembler } from "@/src/content-engine/container";
import { MdxContent } from "@/src/content-engine/mdx-content";
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
      <main style={{ padding: 32 }}>
        <p>
          No &quot;{activeLocale}&quot; variant exists for this content. Try{" "}
          {Object.keys(lesson.content.variants).join(", ")}.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
      <article>
        <MdxContent code={variant.body.value} />
      </article>

      {lesson.assets.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2>Assets ({lesson.assets.length})</h2>
          <ul>
            {lesson.assets.map((asset) => (
              <li key={asset.assetId} style={{ marginBottom: 16 }}>
                <strong>{asset.title}</strong> — {asset.type}
                <br />
                {asset.type === "image" || asset.type === "diagram" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.resourceKey}
                    alt={asset.metadata.alt ?? asset.title}
                    style={{ maxWidth: 300, marginTop: 8 }}
                  />
                ) : (
                  <a href={asset.resourceKey}>{asset.resourceKey}</a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
