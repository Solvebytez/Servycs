import { Router } from "express";
import {
  createAppReview,
  getAppReviews,
  getUserAppReview,
  updateAppReview,
  deleteAppReview,
  markReviewHelpful,
  getAppReviewsForModeration,
  updateReviewStatus,
} from "../controllers/appReviewController";
import { authenticate, requireAdmin } from "../middleware/auth";
// import { validateRequest } from "../middleware/validateRequest";
// import {
//   createAppReviewSchema,
//   updateAppReviewSchema,
//   getAppReviewsSchema,
//   markReviewHelpfulSchema,
//   updateReviewStatusSchema,
//   getReviewsForModerationSchema,
// } from "../validators/appReviewValidators";

const router = Router();

// Public routes
router.get("/", getAppReviews); // Get all public app reviews with pagination and filters
router.post("/:reviewId/helpful", markReviewHelpful); // Mark review as helpful/not helpful

// User routes (require authentication)
router.post("/", authenticate, createAppReview); // Create a new app review
router.get("/my-review", authenticate, getUserAppReview); // Get user's own review
router.put("/my-review", authenticate, updateAppReview); // Update user's own review
router.delete("/my-review", authenticate, deleteAppReview); // Delete user's own review

// Admin routes (require admin authentication)
router.get(
  "/admin/moderation",
  authenticate,
  requireAdmin,
  getAppReviewsForModeration
); // Get all reviews for moderation
router.put(
  "/admin/:reviewId/status",
  authenticate,
  requireAdmin,
  updateReviewStatus
); // Update review status (approve/reject/hide)

export default router;
