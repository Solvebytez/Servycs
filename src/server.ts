import "express-async-errors";
import express from "express";
import path from "path";
import { serverConfig } from "@/config/server";
import { setupMiddleware } from "@/middleware/setup";
import { setupSwagger } from "@/middleware/swagger";
import { setupRoutes } from "@/routes/setup";
import { tokenLogin, tokenRegister } from "@/controllers/authController";
import { errorHandler } from "@/middleware/errorHandler";
import { notFound } from "@/middleware/notFound";
import { logger } from "@/utils/logger";
import { connectDB } from "@/config/database";
import { tokenCleanupService } from "@/services/tokenCleanupService";

export class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setup();
  }

  private setup(): void {
    // Setup middleware
    setupMiddleware(this.app);

    // Setup Swagger documentation
    setupSwagger(this.app);

    // Serve static files from uploads directory
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        message: "Listro API is running",
        timestamp: new Date().toISOString(),
        environment: serverConfig.nodeEnv,
      });
    });

    // Token-based auth routes (at root level /api/login and /api/register)
    this.app.post("/api/login", tokenLogin);
    this.app.post("/api/register", tokenRegister);

    // Category routes (at root level /api/categories for consistency)
    this.app.use("/api/categories", require("@/routes/category").default);

    // API routes
    this.app.use("/api/v1", setupRoutes());

    // 404 handler
    this.app.use(notFound);

    // Error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDB();
      logger.info("Database connected successfully");

      // Start token cleanup service
      tokenCleanupService.start(6); // Run cleanup every 6 hours

      // Start server
      this.app.listen(serverConfig.port, "0.0.0.0", () => {
        logger.info(
          `🚀 Listro API server running on port ${serverConfig.port}`
        );
        logger.info(`📊 Environment: ${serverConfig.nodeEnv}`);
        logger.info(`🔗 Health check: http://localhost:5000/health`);
        logger.info(`📚 API Documentation: http://localhost:5000/api-docs`);
        logger.info(`🌐 Network access: http://192.168.0.131:5000`);
        logger.info(`🧹 Token cleanup service started`);
      });
    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}
