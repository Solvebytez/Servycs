#!/usr/bin/env ts-node

import { connectDB, disconnectDB } from "../config/database";
import { 
  seedComprehensiveCategories, 
  clearAllCategories, 
  getCategoryStats 
} from "../utils/seedComprehensiveCategories";
import { logger } from "../utils/logger";

async function main() {
  try {
    // Connect to database
    await connectDB();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case "seed":
        logger.info("🌱 Seeding comprehensive categories...");
        await seedComprehensiveCategories();
        await getCategoryStats();
        break;

      case "clear":
        logger.info("🗑️ Clearing all categories...");
        await clearAllCategories();
        break;

      case "reset":
        logger.info("🔄 Resetting categories (clear + seed)...");
        await clearAllCategories();
        await seedComprehensiveCategories();
        await getCategoryStats();
        break;

      case "stats":
        logger.info("📊 Getting category statistics...");
        await getCategoryStats();
        break;

      default:
        logger.info("Usage: npm run seed:categories [command]");
        logger.info("Commands:");
        logger.info("  seed  - Add comprehensive categories (if none exist)");
        logger.info("  clear - Remove all existing categories");
        logger.info("  reset - Clear and re-seed all categories");
        logger.info("  stats - Show category statistics");
        break;
    }

  } catch (error) {
    logger.error("Script failed:", error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDB();
    process.exit(0);
  }
}

// Run the script
main();
