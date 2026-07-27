/**
 * Copies every asset's companion media file into public/content-assets/,
 * mirroring its folder structure. content/ stays the single source of
 * truth; public/ is a generated mirror — never hand-edited, same
 * relationship .velite/ already has to content/**\/*.mdx.
 *
 * Reads from Velite's own generated output (.velite/assets.json) rather
 * than re-parsing the .yml files, so there's exactly one YAML parser
 * in the whole pipeline (Velite's), not two.
 *
 * Run after `velite build` (wired into `npm run content:build`).
 */
import { copyFileSync, mkdirSync } from "fs";
import path from "path";
import { assets } from "../.velite";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PUBLIC_ROOT = path.join(process.cwd(), "public", "content-assets");

function main() {
  if (assets.length === 0) {
    console.log("No assets found — nothing to sync.");
    return;
  }

  for (const asset of assets as Array<{
    assetId: string;
    path: string;
    file: string;
  }>) {
    const folder = asset.path.replace(/\/[^/]+$/, ""); // strip the descriptor's own filename
    const sourceFile = path.join(CONTENT_ROOT, folder, asset.file);
    const destFolder = path.join(PUBLIC_ROOT, folder);
    const destFile = path.join(destFolder, asset.file);

    try {
      mkdirSync(destFolder, { recursive: true });
      copyFileSync(sourceFile, destFile);
      console.log(`✅ ${folder}/${asset.file}`);
    } catch {
      console.error(
        `❌ Could not copy "${asset.file}" for asset "${asset.assetId}" — is it actually sitting next to its .yml descriptor?`,
      );
    }
  }
}

main();
