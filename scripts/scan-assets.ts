/**
 * Scans every content/**\/assets/ folder for media files that don't yet
 * have a matching .yml descriptor, and generates a stub for each —
 * type inferred from the file extension, file field set to the exact
 * real filename (never a TODO), assetId generated (slug + short hash,
 * never hand-typed).
 *
 * The only thing left for a human to fix afterward is `title` (and
 * optionally alt/tags) — everything mechanical is already correct.
 *
 * Usage:
 *   npx tsx scripts/scan-assets.ts
 */
import { readdirSync, statSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const EXTENSION_TYPE_MAP: Record<string, string> = {
  ".mp4": "video",
  ".mov": "video",
  ".webm": "video",
  ".pdf": "document",
  ".doc": "document",
  ".docx": "document",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".gif": "image",
  ".svg": "image",
  ".mp3": "audio",
  ".wav": "audio",
};

function findAssetFolders(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (!statSync(fullPath).isDirectory()) continue;
    if (entry === "assets") {
      found.push(fullPath);
    } else {
      found.push(...findAssetFolders(fullPath));
    }
  }
  return found;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortHash(): string {
  return randomBytes(2).toString("hex");
}

function main() {
  const assetFolders = findAssetFolders(CONTENT_ROOT);
  let created = 0;
  let skipped = 0;

  for (const folder of assetFolders) {
    const entries = readdirSync(folder);
    const descriptors = entries.filter((f) => f.endsWith(".yml"));
    const alreadyDescribed = new Set(
      descriptors
        .map((f) => {
          const content = readFileSync(path.join(folder, f), "utf-8");
          const match = content.match(/^file:\s*"?(.+?)"?\s*$/m);
          return match?.[1];
        })
        .filter(Boolean),
    );

    for (const entry of entries) {
      const ext = path.extname(entry).toLowerCase();
      if (!(ext in EXTENSION_TYPE_MAP)) continue; // not a known media file
      if (alreadyDescribed.has(entry)) {
        skipped++;
        continue;
      }

      const slug = slugify(entry);
      const assetId = `${slug}-${shortHash()}`;
      const yamlPath = path.join(folder, `${slug}.yml`);

      const yaml = `assetId: ${assetId}
type: ${EXTENSION_TYPE_MAP[ext]}
title: "${titleize(slug)}"
origin: manual
file: "${entry}"
metadata:
  alt: ""
  tags: []
`;

      writeFileSync(yamlPath, yaml);
      console.log(`✅ ${path.relative(CONTENT_ROOT, yamlPath)}`);
      created++;
    }
  }

  console.log(
    `\n${created} descriptor(s) created, ${skipped} file(s) already described.`,
  );
  if (created > 0) {
    console.log(`Review the auto-generated "title" fields before committing.`);
  }
}

main();
