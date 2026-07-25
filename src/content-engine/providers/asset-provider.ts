import type { Asset } from "../domain/asset";

export interface AssetProvider {
  getById(assetId: string): Promise<Asset | null>;
}
