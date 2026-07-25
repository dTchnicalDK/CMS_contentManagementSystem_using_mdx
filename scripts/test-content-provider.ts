import { VeliteContentProvider } from "@/src/content-engine/providers/velite-content-provider";

const contentProvider = new VeliteContentProvider();

async function main() {
  const contentId = "history.indus-valley-civilization";

  // Test 1: Get one localized variant
  const hindiVariant = await contentProvider.getById(contentId, "hi");

  console.log("\n=== Hindi Variant ===");
  if (!hindiVariant) {
    throw new Error("❌ Hindi variant not found");
  }

  console.log("✅ Hindi variant found");

  // Test 2: Get complete logical content
  const logicalContent = await contentProvider.getContentById(contentId);

  console.log("\n=== Logical Content ===");
  console.log(logicalContent, { depth: null });
  //3.
  const missingId = await contentProvider.getById("unknown", "en");

  console.log("\n=== missing id ===");
  console.log(missingId, { depth: null });
  //4.
  const missingGetById = await contentProvider.getById("", "hi");

  console.log("\n=== missingGetById ===");
  console.log(missingGetById, { depth: null });
}

main();
