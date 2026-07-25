import type { Asset } from "./asset";
import type { Content } from "./content";

export type Lesson = {
  content: Content;

  assets: Asset[];
};
