import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  seedComprehensiveCategories,
  clearAllCategories,
  getCategoryStats,
} from "../utils/seedComprehensiveCategories";
import { logger } from "../utils/logger";

const router = Router();

// All admin category routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/categories/seed:
 *   post:
 *     summary: Seed comprehensive categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories seeded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/seed", async (req, res) => {
  try {
    logger.info("Admin triggered category seeding");
    await seedComprehensiveCategories();
    await getCategoryStats();

    res.json({
      success: true,
      message: "Comprehensive categories seeded successfully",
    });
  } catch (error) {
    logger.error("Error seeding categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed categories",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/categories/clear:
 *   delete:
 *     summary: Clear all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete("/clear", async (req, res) => {
  try {
    logger.info("Admin triggered category clearing");
    await clearAllCategories();

    res.json({
      success: true,
      message: "All categories cleared successfully",
    });
  } catch (error) {
    logger.error("Error clearing categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear categories",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/categories/reset:
 *   post:
 *     summary: Reset categories (clear and seed)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories reset successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/reset", async (req, res) => {
  try {
    logger.info("Admin triggered category reset");
    await clearAllCategories();
    await seedComprehensiveCategories();
    await getCategoryStats();

    res.json({
      success: true,
      message: "Categories reset successfully",
    });
  } catch (error) {
    logger.error("Error resetting categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset categories",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/categories/stats:
 *   get:
 *     summary: Get category statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/stats", async (req, res) => {
  try {
    const { prisma } = await import("../config/database");

    const totalCategories = await prisma.category.count();
    const rootCategories = await prisma.category.count({
      where: { parentId: null },
    });
    const leafCategories = await prisma.category.count({
      where: {
        children: {
          none: {},
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalCategories,
        rootCategories,
        leafCategories,
        intermediateCategories:
          totalCategories - rootCategories - leafCategories,
      },
    });
  } catch (error) {
    logger.error("Error getting category stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category statistics",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

export default router;
