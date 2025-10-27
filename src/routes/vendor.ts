import { Router } from "express";
import { authenticate, requireVendor } from "@/middleware/auth";
import { getVendorMetrics } from "@/controllers/vendorMetricsController";

const router = Router();

// TODO: Implement vendor routes
router.get("/dashboard", authenticate, requireVendor, (req, res) => {
  res.json({ message: "Vendor dashboard route - to be implemented" });
});

// Vendor metrics for dashboard cards
router.get("/me/metrics", authenticate, requireVendor, getVendorMetrics);

export default router;
