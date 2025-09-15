import {
  seedDeepCategories,
  getTreeDepthStats,
} from "../utils/seedDeepCategories";

async function main() {
  try {
    console.log("🌱 Starting deep category seeding...");

    // Seed the deep categories
    await seedDeepCategories();

    console.log("✅ Deep category seeding completed!");

    // Get and display statistics
    console.log("\n📊 Tree Statistics:");
    await getTreeDepthStats();

    console.log("\n🎉 Deep category system is ready!");
    console.log(
      "The system now supports unlimited depth with 5+ levels of nesting."
    );
  } catch (error) {
    console.error("❌ Error during deep category seeding:", error);
    process.exit(1);
  }
}

main();
