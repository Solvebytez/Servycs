import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import vendorRoutes from "./vendor";
import serviceRoutes from "./service";
import bookingRoutes from "./booking";
import adminRoutes from "./admin";
import uploadRoutes from "./upload";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Listro API is running",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
  });
});

// API Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/vendors", vendorRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);

export default router;
