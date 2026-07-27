/**
 * Scaffolds a new asset YAML file with a generated assetId
 * (slug + short hash), so the id is never hand-typed.
 *
 * Assets are co-located with the content that owns them, e.g.:
 *
 * Usage:
 *   npx tsx scripts/new-asset.ts "Harappa City Map" \
 *     content/history/ancient-india/indus-valley-civilization/assets
 */
import { randomBytes } from "crypto";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function shortHash(): string {
  return randomBytes(2).toString("hex"); // 4 hex chars
}

function main() {
  const [, , title, targetDir] = process.argv;

  if (!title || !targetDir) {
    console.error('Usage: npx tsx scripts/new-asset.ts "<title>" <target-dir>');
    process.exit(1);
  }

  const slug = slugify(title);
  const assetId = `${slug}-${shortHash()}`;
  const fileName = `${slug}.yml`;
  const filePath = path.join(targetDir, fileName);

  if (existsSync(filePath)) {
    console.error(`❌ File already exists: ${filePath}`);
    process.exit(1);
  }

  mkdirSync(targetDir, { recursive: true });

  const yaml = `assetId: ${assetId}
type: image
title: "${title}"
origin: manual
file: "TODO-put-the-actual-filename-here.ext"
metadata:
  alt: ""
  tags: []
`;

  writeFileSync(filePath, yaml);

  console.log(`✅ Created ${filePath}`);
  console.log(`   assetId: ${assetId}`);
}

main();
