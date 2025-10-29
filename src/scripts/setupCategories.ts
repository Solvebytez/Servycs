#!/usr/bin/env ts-node

/**
 * Setup script for the nested category system
 * Run this script to initialize the category system in your database
 *
 * Usage:
 * npm run setup:categories
 * or
 * npx ts-node src/scripts/setupCategories.ts
 */

import { migrateToNestedCategories } from "../utils/migrateCategories";
import { logger } from "../utils/logger";

const main = async () => {
  try {
    logger.info("🚀 Starting category system setup...");

    await migrateToNestedCategories();

    logger.info("✅ Category system setup completed successfully!");
    logger.info("📋 Available API endpoints:");
    logger.info(
      "   GET    /api/categories/root           - Get root categories"
    );
    logger.info(
      "   GET    /api/categories/:id/children   - Get category children"
    );
    logger.info(
      "   GET    /api/categories/:id/has-children - Check if has children"
    );
    logger.info(
      "   GET    /api/categories/:id            - Get category by ID"
    );
    logger.info(
      "   GET    /api/categories/admin/tree     - Get full category tree (admin)"
    );
    logger.info(
      "   POST   /api/categories/admin          - Create category (admin)"
    );
    logger.info(
      "   PUT    /api/categories/admin/:id      - Update category (admin)"
    );
    logger.info(
      "   DELETE /api/categories/admin/:id      - Delete category (admin)"
    );

    process.exit(0);
  } catch (error) {
    logger.error("❌ Category system setup failed:", error);
    process.exit(1);
  }
};

// Run the setup
main();
