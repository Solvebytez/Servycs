import { Router } from "express";
import {
  createServiceReview,
  getServiceReviews,
  getUserServiceReview,
  updateServiceReview,
  deleteServiceReview,
  toggleReviewHelpful,
  checkReviewHelpful,
} from "../controllers/serviceReviewController";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import { body, param, query } from "express-validator";

const router = Router();

// Validation arrays
const createServiceReviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .isLength({ min: 10, max: 500 })
    .withMessage("Comment must be between 10 and 500 characters"),
  body("listingId").notEmpty().withMessage("Listing ID is required"),
  body("vendorId").notEmpty().withMessage("Vendor ID is required"),
];

const updateServiceReviewValidation = [
  param("reviewId").notEmpty().withMessage("Review ID is required"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Comment must be between 10 and 500 characters"),
];

const getServiceReviewsValidation = [
  param("listingId").notEmpty().withMessage("Listing ID is required"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const getUserServiceReviewValidation = [
  param("listingId").notEmpty().withMessage("Listing ID is required"),
];

const deleteServiceReviewValidation = [
  param("reviewId").notEmpty().withMessage("Review ID is required"),
];

const toggleReviewHelpfulValidation = [
  param("reviewId").notEmpty().withMessage("Review ID is required"),
];

// Public routes
router.get(
  "/listing/:listingId",
  getServiceReviewsValidation,
  validateRequest,
  getServiceReviews
); // Get all reviews for a specific service listing

// User routes (require authentication)
router.post(
  "/",
  authenticate,
  createServiceReviewValidation,
  validateRequest,
  createServiceReview
); // Create a new service review

router.get(
  "/listing/:listingId/my-review",
  authenticate,
  getUserServiceReviewValidation,
  validateRequest,
  getUserServiceReview
); // Get user's review for a specific service

router.put(
  "/:reviewId",
  authenticate,
  updateServiceReviewValidation,
  validateRequest,
  updateServiceReview
); // Update user's service review

router.delete(
  "/:reviewId",
  authenticate,
  deleteServiceReviewValidation,
  validateRequest,
  deleteServiceReview
); // Delete user's service review

router.post(
  "/:reviewId/helpful",
  authenticate,
  toggleReviewHelpfulValidation,
  validateRequest,
  toggleReviewHelpful
); // Toggle helpful vote for a review

router.get(
  "/:reviewId/helpful",
  authenticate,
  toggleReviewHelpfulValidation,
  validateRequest,
  checkReviewHelpful
); // Check if user has marked review as helpful

export default router;
