import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";

export type TocNode = {
  depth: number;
  value: string;
  children: TocNode[];
};

/**
 * Compiles Velite's MDX function-body output and returns both the
 * renderable component and the `toc` export baked in by remark-mdx-toc
 * (see velite.config.ts). One compile, both pieces — LessonView renders
 * the TOC and the article from the same source of truth, not two.
 */
export async function compileMdx(code: string): Promise<{
  Content: ComponentType<{ components?: MDXComponents }>;
  toc: TocNode[];
}> {
  const mod = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return {
    Content: mod.default,
    toc: (mod as unknown as { toc?: TocNode[] }).toc ?? [],
  };
}
