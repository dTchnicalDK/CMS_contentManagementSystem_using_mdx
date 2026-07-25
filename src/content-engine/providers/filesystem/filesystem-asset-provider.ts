import { AssetProvider } from "../asset-provider";

export class FilesystemAssetProvider implements AssetProvider {
  async getById(assetId: string) {
    return assetManifest[assetId] ?? null;
  }
}
