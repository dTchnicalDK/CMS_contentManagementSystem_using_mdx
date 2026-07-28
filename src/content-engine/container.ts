import { VeliteContentProvider } from "./providers/velite-content-provider";
import { FilesystemAssetProvider } from "./providers/filesystem/filesystem-asset-provider";
import { LessonAssembler } from "./lesson-assembler";

export const contentProvider = new VeliteContentProvider();
export const assetProvider = new FilesystemAssetProvider();
export const lessonAssembler = new LessonAssembler(
  contentProvider,
  assetProvider,
);
