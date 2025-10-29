import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import {
  createServiceListing,
  getServiceListings,
  getServiceListingById,
  getServiceListingsByVendor,
  updateServiceListing,
  deleteServiceListing,
} from "@/controllers/serviceController";
import {
  validateCreateServiceListing,
  validateUpdateServiceListing,
  validateGetServiceListings,
  validateGetServiceListingById,
  validateDeleteServiceListing,
} from "@/validators/serviceValidators";

const router = Router();

// Public routes (no authentication required)
router.get("/", validateGetServiceListings, getServiceListings);
router.get("/:id", validateGetServiceListingById, getServiceListingById);

// Protected routes (authentication required)
router.use(authenticate);

// Vendor-specific routes
router.post("/", validateCreateServiceListing, createServiceListing);
router.get("/vendor/my-listings", getServiceListingsByVendor);
router.put("/:id", validateUpdateServiceListing, updateServiceListing);
router.delete("/:id", validateDeleteServiceListing, deleteServiceListing);

export default router;
