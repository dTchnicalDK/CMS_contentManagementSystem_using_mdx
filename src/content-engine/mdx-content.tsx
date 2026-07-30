import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXComponents } from "mdx/types";

export async function MdxContent({
  code,
  components,
}: {
  code: string;
  components?: MDXComponents;
}) {
  const { default: Content } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return <Content components={components} />;
}
