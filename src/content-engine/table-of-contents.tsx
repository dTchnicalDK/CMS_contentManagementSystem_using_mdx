import GithubSlugger from "github-slugger";
import { TocNode } from "./ui/mdx-content";

type FlatEntry = { depth: number; value: string; slug: string };

function flatten(nodes: TocNode[], slugger: GithubSlugger): FlatEntry[] {
  const out: FlatEntry[] = [];

  for (const node of nodes) {
    // Slug every heading, in document order — including ones we won't
    // display — so the slugger's duplicate-disambiguation counter stays
    // in sync with rehype-slug's, which slugs the real H1 too.
    out.push({
      depth: node.depth,
      value: node.value,
      slug: slugger.slug(node.value),
    });
    out.push(...flatten(node.children, slugger));
  }

  return out;
}

export function TableOfContents({ toc }: { toc: TocNode[] }) {
  const slugger = new GithubSlugger();
  // Depth 1 is the page's own H1 (title, already shown separately) —
  // slugged above for sync, but not shown in the TOC itself.
  const entries = flatten(toc, slugger).filter((e) => e.depth >= 2);

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="my-8 rounded-md border border-border bg-card p-4"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
        On this page
      </p>
      <ul className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.slug}
            style={{ paddingLeft: `${(entry.depth - 2) * 16}px` }}
          >
            <a
              href={`#${entry.slug}`}
              className="text-muted-foreground hover:text-accent hover:underline"
            >
              {entry.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
