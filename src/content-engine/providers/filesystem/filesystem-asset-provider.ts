import type { Asset } from "../../domain/asset";
import { toAssets } from "../../adapters/velite/to-asset";
import { AssetProvider } from "../asset-provider";
import { assets } from "@/.velite";

export class FilesystemAssetProvider implements AssetProvider {
  private readonly assets: Asset[];

  private readonly assetIndex = new Map<string, Asset>();

  constructor() {
    this.assets = toAssets(assets);
    this.buildAssetIndex();
  }

  private buildAssetIndex(): void {
    for (const asset of this.assets) {
      this.assetIndex.set(asset.assetId, asset);
    }
  }

  async getById(assetId: string): Promise<Asset | null> {
    return this.assetIndex.get(assetId) ?? null;
  }
}
