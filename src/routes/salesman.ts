import { Router } from "express";
import { authenticate, requireSalesman } from "@/middleware/auth";
import {
  getSalesmanVendors,
  getSalesmanMetrics,
} from "../controllers/salesmanController";
import { resendVendorOTP } from "@/controllers/authController";

const router = Router();

// Get salesman metrics for dashboard
router.get("/me/metrics", authenticate, requireSalesman, getSalesmanMetrics);

// Get vendors created by a specific salesman
router.get(
  "/:salesmanId/vendors",
  authenticate,
  requireSalesman,
  getSalesmanVendors
);

// Resend OTP for vendor verification (salesman can resend for their vendors)
router.post(
  "/vendors/:vendorId/resend-otp",
  authenticate,
  requireSalesman,
  resendVendorOTP
);

export default router;
