import { defineCollection, defineConfig, s } from "velite";
import type {
  SyllabusNodeRef,
  Locale,
} from "./src/content-engine/domain/content";
import type { AssetReference } from "./src/content-engine/domain/asset";

// ------------types declaration section------------

type ContentForValidation = {
  contentId: string;
  locale: Locale;
  path: string;
  syllabusRefs: SyllabusNodeRef[];
  assetRefs: AssetReference[];
};

type AssetForValidation = {
  assetId: string;
  path: string;
};

//----------------- Compare syllabus references across locale variants----------------------------
function areSyllabusRefsEqual(
  a: SyllabusNodeRef[],
  b: SyllabusNodeRef[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((ref, index) => {
    return ref.exam === b[index].exam && ref.path === b[index].path;
  });
}

//----------------- Compare asset references across locale variants----------------------------
// Deliberately ignores `caption`: captions are translatable text and are
// allowed to differ per locale. assetId + order must match — a lesson's
// English and Hindi variants must point at the same underlying assets,
// in the same order.
function areAssetRefsEqual(a: AssetReference[], b: AssetReference[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((ref, index) => {
    return ref.assetId === b[index].assetId && ref.order === b[index].order;
  });
}

// ---------functions to validate unique content id---( Collection-level content integrity validation)-------------
function getContentFolder(path: string): string {
  return path.replace(/\/page(?:\.hi)?$/, "");
}

function validateContentIntegrity(contents: ContentForValidation[]): void {
  const contentIdToFolder = new Map<string, string>();
  const folderToContentId = new Map<string, string>();
  const seenVariants = new Set<string>();
  const contentIdToSyllabusRefs = new Map<string, SyllabusNodeRef[]>();
  const contentIdToAssetRefs = new Map<string, AssetReference[]>();

  for (const content of contents) {
    const folder = getContentFolder(content.path);
    const variantKey = `${content.contentId}:${content.locale}`;

    // Rule 1: one contentId belongs to only one folder.
    const existingFolder = contentIdToFolder.get(content.contentId);

    if (existingFolder && existingFolder !== folder) {
      throw new Error(
        `Content ID "${content.contentId}" is used in multiple folders:
- ${existingFolder}
- ${folder}`,
      );
    }

    contentIdToFolder.set(content.contentId, folder);

    // Rule 2: one folder belongs to only one contentId.
    const existingContentId = folderToContentId.get(folder);

    if (existingContentId && existingContentId !== content.contentId) {
      throw new Error(
        `Folder "${folder}" contains multiple content IDs:
- ${existingContentId}
- ${content.contentId}`,
      );
    }

    folderToContentId.set(folder, content.contentId);

    // Rule 3: each contentId + locale combination must be unique.
    if (seenVariants.has(variantKey)) {
      throw new Error(`Duplicate content variant: "${variantKey}"`);
    }

    // Rule 4: same contentId → same syllabusRefs (all locale variants of the same contentId must have identical syllabus references.)
    const existingRefs = contentIdToSyllabusRefs.get(content.contentId);

    if (
      existingRefs &&
      !areSyllabusRefsEqual(existingRefs, content.syllabusRefs)
    ) {
      throw new Error(
        `Content ID "${content.contentId}" has inconsistent syllabus references across locale variants.`,
      );
    }

    if (!existingRefs) {
      contentIdToSyllabusRefs.set(content.contentId, content.syllabusRefs);
    }

    // Rule 5: same contentId → same assetRefs (assetId + order; caption may differ per locale)
    const existingAssetRefs = contentIdToAssetRefs.get(content.contentId);

    if (
      existingAssetRefs &&
      !areAssetRefsEqual(existingAssetRefs, content.assetRefs)
    ) {
      throw new Error(
        `Content ID "${content.contentId}" has inconsistent asset references across locale variants.`,
      );
    }

    if (!existingAssetRefs) {
      contentIdToAssetRefs.set(content.contentId, content.assetRefs);
    }

    seenVariants.add(variantKey);
  }
}

// ---------function to validate unique asset id---( Collection-level asset integrity validation)-------------
function validateAssetIntegrity(assets: AssetForValidation[]): void {
  const assetIdToPath = new Map<string, string>();

  for (const asset of assets) {
    const existingPath = assetIdToPath.get(asset.assetId);

    // Rule: assetId must be globally unique. Since assetId is generated
    // (slug + short hash) rather than hand-typed, a collision almost
    // always means a file was copy-pasted without regenerating the id.
    if (existingPath && existingPath !== asset.path) {
      throw new Error(
        `Duplicate asset ID "${asset.assetId}" found in:
- ${existingPath}
- ${asset.path}`,
      );
    }

    assetIdToPath.set(asset.assetId, asset.path);
  }
}

// ------------helper function - derive the public-facing resourceKey for an asset------------
const PUBLIC_ASSET_BASE = "/content-assets";

function getResourceKey(path: string, file: string): string {
  const folder = path.replace(/\/[^/]+$/, ""); // strip the yml's own filename
  return `${PUBLIC_ASSET_BASE}/${folder}/${file}`;
}

// ------------helper function- decide hindi/english version of content------------

const getLocaleFromPath = (path: string): Locale => {
  if (path.endsWith("/page.hi")) {
    return "hi";
  }
  if (path.endsWith("/page")) {
    return "en";
  }
  throw new Error(
    `Invalid content filename: "${path}". Expected page.mdx or page.hi.mdx.`,
  );
};

// --------------------------------main--------------
const contents = defineCollection({
  name: "Content",
  pattern: "**/*.mdx",

  schema: s
    .object({
      contentId: s.string(),
      title: s.string(),
      syllabusRefs: s.array(
        s.object({
          exam: s.string(),
          path: s.string(),
        }),
      ),

      assetRefs: s
        .array(
          s.object({
            assetId: s.string(),
            order: s.number().default(0),
            // caption: s.string().optional(),
          }),
        )
        .default([]),

      path: s.path(),

      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      locale: getLocaleFromPath(data.path),
    })),
});

// --------------------------------assets--------------
const assets = defineCollection({
  name: "Asset",
  pattern: "**/assets/*.yml",

  schema: s
    .object({
      assetId: s.string(),

      type: s.enum([
        "image",
        "video",
        "audio",
        "document",
        "timeline",
        "concept-map",
        "diagram",
      ]),

      title: s.string(),
      description: s.string().optional(),

      origin: s.enum(["manual", "ai-generated", "ai-assisted", "imported"]),

      // The filename of the actual media file, expected to sit in the
      // SAME folder as this .yml descriptor. resourceKey (the public URL)
      // is derived from this + the descriptor's own path — never
      // hand-typed, so it can never drift from where the file actually is.
      file: s.string(),

      metadata: s
        .object({
          alt: s.string().optional(),
          source: s.string().optional(),
          author: s.string().optional(),
          license: s.string().optional(),
          tags: s.array(s.string()).optional(),
        })
        .default({}),

      path: s.path(),
    })
    .transform((data) => ({
      ...data,
      resourceKey: getResourceKey(data.path, data.file),
    })),
});

export default defineConfig({
  root: "content",

  collections: {
    contents,
    assets,
  },
  prepare(data) {
    validateContentIntegrity(data.contents); //for checking if contentid and folder structure is unique. (Collection-level integrity validation)
    validateAssetIntegrity(data.assets); //for checking assetId is globally unique. (Collection-level integrity validation)
  },
});
