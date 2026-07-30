import type { Lesson } from "./domain/lesson";
import type { Asset } from "./domain/asset";
import type { ContentVariant } from "./domain/content";
import { MdxContent } from "./mdx-content";
import { ImageLightbox } from "./image-lightbox";

function AssetBlock({ asset }: { asset: Asset }) {
  if (asset.type === "image" || asset.type === "diagram") {
    return (
      <figure className="my-6 max-w-sm">
        <ImageLightbox
          src={asset.resourceKey}
          alt={asset.metadata.alt ?? asset.title}
          title={asset.title}
        />
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

  function AssetRef({ id, caption }: { id: string; caption?: string }) {
    const asset = assetsById.get(id);

    if (!asset) {
      return (
        <div className="my-6 rounded-md border-2 border-dashed border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Unknown asset id: <code>{id}</code>. Check it matches an entry in this
          content&apos;s <code>assetRefs</code> and a real asset&apos;s{" "}
          <code>assetId</code>.
        </div>
      );
    }

    return (
      <>
        <AssetBlock asset={asset} />
        {caption && (
          <p className="-mt-4 mb-6 max-w-sm text-sm text-muted-foreground">
            {caption}
          </p>
        )}
      </>
    );
  }

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
        <MdxContent code={variant.body.value} components={{ AssetRef }} />
      </article>
    </main>
  );
}
