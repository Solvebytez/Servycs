import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import { seedCategories } from "./seedCategories";

const prisma = new PrismaClient();

/**
 * Migration script to convert from enum-based categories to nested category system
 * This script will:
 * 1. Create the new Category model structure
 * 2. Seed default categories based on the original enum
 * 3. Handle any existing services (if any)
 */
export const migrateToNestedCategories = async (): Promise<void> => {
  try {
    logger.info("Starting migration to nested categories...");

    // Step 1: Check if Category model already exists
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      logger.info("Categories already exist, skipping migration");
      return;
    }

    // Step 2: Seed default categories
    logger.info("Seeding default categories...");
    await seedCategories();

    // Step 3: Check for any existing services that might need migration
    const existingServices = await prisma.service.count();
    if (existingServices > 0) {
      logger.warn(
        `Found ${existingServices} existing services. These will need manual migration to use the new category system.`
      );
      logger.warn(
        "Please update these services to use valid categoryId values."
      );
    }

    logger.info("Migration to nested categories completed successfully");
  } catch (error) {
    logger.error("Error during category migration:", error);
    throw error;
  }
};

/**
 * Rollback function to remove categories (for testing purposes)
 */
export const rollbackCategories = async (): Promise<void> => {
  try {
    logger.info("Starting rollback of category system...");

    // Delete all categories (cascade will handle children)
    await prisma.category.deleteMany({});

    logger.info("Category system rollback completed");
  } catch (error) {
    logger.error("Error during category rollback:", error);
    throw error;
  }
};

// Export for use in other files
export default { migrateToNestedCategories, rollbackCategories };
