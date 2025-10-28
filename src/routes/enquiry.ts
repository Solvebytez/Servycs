import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import {
  createEnquiry,
  getEnquiries,
  getVendorEnquiries,
  getUserEnquiries,
  updateEnquiryStatus,
  getEnquiryStats,
  validateCreateEnquiry,
  validateGetEnquiries,
  validateUpdateEnquiryStatus,
  validateGetEnquiryStats,
} from "@/controllers/enquiryController";

const router = Router();

// Public routes (no authentication required for creating enquiries)
router.post("/", validateCreateEnquiry, createEnquiry);

// Protected routes (authentication required)
router.get("/", authenticate, validateGetEnquiries, getEnquiries);
router.get("/stats", authenticate, validateGetEnquiryStats, getEnquiryStats);
router.get("/vendor/:vendorId", authenticate, getVendorEnquiries);
router.get("/user/:userId", authenticate, getUserEnquiries);
router.patch(
  "/:id/status",
  authenticate,
  validateUpdateEnquiryStatus,
  updateEnquiryStatus
);

export default router;
