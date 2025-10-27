import { Router } from "express";
import { env } from "@/config/env";
import authRoutes from "./auth";

import userRoutes from "./user";
import vendorRoutes from "./vendor";
import serviceRoutes from "./service";
import bookingRoutes from "./booking";
import adminRoutes from "./admin";
import uploadRoutes from "./upload";
import promotionRoutes from "./promotion";
import appReviewRoutes from "./appReview";
import serviceReviewRoutes from "./serviceReview";
import savedListsRoutes from "./savedLists";
import salesmanRoutes from "./salesman";

export const setupRoutes = (): Router => {
  const router = Router();

  // Health check
  router.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Listro API is running",
      timestamp: new Date().toISOString(),
      version: env.API_VERSION,
    });
  });

  // API Routes
  router.use("/auth", authRoutes);
  router.use("/users", userRoutes);
  router.use("/users", savedListsRoutes); // Saved lists routes are under /users
  router.use("/vendors", vendorRoutes);
  router.use("/services", serviceRoutes);
  router.use("/bookings", bookingRoutes);
  router.use("/admin", adminRoutes);
  router.use("/upload", uploadRoutes);
  router.use("/promotions", promotionRoutes);
  router.use("/app-reviews", appReviewRoutes);
  router.use("/service-reviews", serviceReviewRoutes);
  router.use("/salesmen", salesmanRoutes);

  return router;
};
