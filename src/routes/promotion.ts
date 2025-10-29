import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPromotion,
  getVendorPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getPromotionDetails,
} from "../controllers/promotionController";
import {
  createPromotionValidation,
  updatePromotionValidation,
} from "../validators/promotionValidators";

const router = Router();

// Public routes (no authentication required)
router.get("/active", getActivePromotions);
router.get("/details/:id", getPromotionDetails);

// All other promotion routes require vendor authentication
router.use(authenticate);

// Create a new promotion
router.post("/", createPromotionValidation, validateRequest, createPromotion);

// Get vendor's promotions
router.get("/", getVendorPromotions);

// Get a single promotion by ID
router.get("/:id", getPromotionById);

// Update a promotion
router.put("/:id", updatePromotionValidation, validateRequest, updatePromotion);

// Delete a promotion
router.delete("/:id", deletePromotion);

export default router;
