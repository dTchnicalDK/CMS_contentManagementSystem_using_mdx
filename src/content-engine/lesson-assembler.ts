import type { Asset } from "./domain/asset";
import type { Lesson } from "./domain/lesson";
import type { Content } from "./domain/content";
import type { AssetProvider } from "./providers/asset-provider";
import type { ContentProvider } from "./providers/content-provider";

export class LessonAssembler {
  constructor(
    private readonly contentProvider: ContentProvider,
    private readonly assetProvider: AssetProvider,
  ) {}

  async getLesson(contentId: string): Promise<Lesson | null> {
    const content = await this.contentProvider.getContentById(contentId);

    if (!content) {
      return null;
    }

    const assets = await this.loadAssets(content);

    return {
      content,
      assets,
    };
  }

  private async loadAssets(content: Content): Promise<Asset[]> {
    const assets = await Promise.all(
      content.assetRefs.map((ref) => this.assetProvider.getById(ref.assetId)),
    );

    return assets.filter((asset): asset is Asset => asset !== null);
  }

  // private async loadAssets(content: Content): Promise<Asset[]> {
  //   const assets: Asset[] = [];

  //   for (const ref of content.assetRefs) {
  //     const asset = await this.assetProvider.getById(ref.assetId);

  //     if (asset) {
  //       assets.push(asset);
  //     }
  //   }

  //   return assets;
  // }
}
