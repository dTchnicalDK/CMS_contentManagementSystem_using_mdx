import { contentProvider } from "../src/content-engine/providers/velite";

async function main() {
  const contentId = "history.indus-valley-civilization";

  // Test 1: Get one localized variant
  const hindiVariant = await contentProvider.getById(contentId, "hi");

  console.log("\n=== Hindi Variant ===");
  console.dir(hindiVariant, { depth: null });

  // Test 2: Get complete logical content
  const logicalContent = await contentProvider.getContentById(contentId);

  console.log("\n=== Logical Content ===");
  console.dir(logicalContent, { depth: null });
}

main();
