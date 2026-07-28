import Image from "next/image";
import type { Lesson } from "./domain/lesson";
import type { Asset } from "./domain/asset";
import type { ContentVariant } from "./domain/content";
import { MdxContent } from "./mdx-content";

function AssetBlock({ asset }: { asset: Asset }) {
  if (asset.type === "image" || asset.type === "diagram") {
    return (
      <figure className="my-6 max-w-sm">
        <div className="relative aspect-4/3 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={asset.resourceKey}
            alt={asset.metadata.alt ?? asset.title}
            fill
            sizes="(max-width: 384px) 100vw, 384px"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-sm italic text-muted-foreground">
          {asset.title}
        </figcaption>
      </figure>
    );
  }

  if (asset.type === "video") {
    return (
      <figure className="my-6 max-w-lg">
        <video
          controls
          preload="metadata"
          className="w-full rounded-md border border-border"
        >
          <source src={asset.resourceKey} />
        </video>
        <figcaption className="mt-2 text-sm italic text-muted-foreground">
          {asset.title}
        </figcaption>
      </figure>
    );
  }

  // document, audio, timeline, concept-map, and anything else: a clean
  // download/open card, not a bare link.
  return (
    <a
      href={asset.resourceKey}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex max-w-sm items-center gap-3 rounded-md border border-border bg-card p-3 no-underline transition-colors hover:border-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
        <i className="ti ti-file-text" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-medium text-foreground">
          {asset.title}
        </span>
        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
          {asset.type}
        </span>
      </span>
    </a>
  );
}

export function LessonView({
  lesson,
  variant,
}: {
  lesson: Lesson;
  variant: ContentVariant;
}) {
  const assetsById = new Map(lesson.assets.map((a) => [a.assetId, a]));
  const orderedRefs = [...lesson.content.assetRefs].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <main className="mx-auto max-w-2xl bg-background px-6 py-16 text-foreground">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-accent">
        {lesson.content.syllabusRefs.map((r) => r.exam).join(", ")}
      </p>
      <h1 className="font-serif text-3xl font-semibold leading-tight">
        {variant.title}
      </h1>
      <div className="mb-2 mt-2 h-0.5 w-12 bg-accent" />
      <p className="mb-8 text-xs uppercase tracking-wide text-muted-foreground">
        {lesson.content.syllabusRefs.map((r) => r.path).join(" · ")}
      </p>

      <article className="prose-content max-w-none text-base leading-[1.75]">
        <MdxContent code={variant.body.value} />
      </article>

      {orderedRefs.length > 0 && (
        <section className="mt-4">
          {orderedRefs.map((ref) => {
            const asset = assetsById.get(ref.assetId);
            if (!asset) return null;
            return (
              <div key={ref.assetId}>
                <AssetBlock asset={asset} />
                {ref.caption && (
                  <p className="-mt-4 mb-6 max-w-sm text-sm text-muted-foreground">
                    {ref.caption}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
