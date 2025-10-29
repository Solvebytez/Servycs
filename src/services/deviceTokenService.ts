import { prisma } from "@/config/database";
import { DeviceToken, User } from "@prisma/client";
import { logger } from "@/utils/logger";

export interface CreateDeviceTokenData {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  deviceId?: string;
  appVersion?: string;
}

export interface DeviceTokenWithUser extends DeviceToken {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface GetDeviceTokensOptions {
  userId?: string;
  platform?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export class DeviceTokenService {
  /**
   * Register a new device token for a user
   */
  async registerDeviceToken(data: CreateDeviceTokenData): Promise<DeviceToken> {
    try {
      // Check if token already exists
      const existingToken = await prisma.deviceToken.findUnique({
        where: { token: data.token },
      });

      if (existingToken) {
        // Update existing token
        const updatedToken = await prisma.deviceToken.update({
          where: { token: data.token },
          data: {
            userId: data.userId,
            platform: data.platform,
            deviceId: data.deviceId,
            appVersion: data.appVersion,
            isActive: true,
            lastUsed: new Date(),
          },
        });

        logger.info("Device token updated", {
          tokenId: updatedToken.id,
          userId: updatedToken.userId,
          platform: updatedToken.platform,
        });

        return updatedToken;
      } else {
        // Create new token
        const deviceToken = await prisma.deviceToken.create({
          data: {
            userId: data.userId,
            token: data.token,
            platform: data.platform,
            deviceId: data.deviceId,
            appVersion: data.appVersion,
            isActive: true,
            lastUsed: new Date(),
          },
        });

        logger.info("Device token registered", {
          tokenId: deviceToken.id,
          userId: deviceToken.userId,
          platform: deviceToken.platform,
        });

        return deviceToken;
      }
    } catch (error) {
      logger.error("Failed to register device token", {
        error: error instanceof Error ? error.message : "Unknown error",
        data: { ...data, token: data.token.substring(0, 20) + "..." }, // Log partial token for security
      });
      throw error;
    }
  }

  /**
   * Get device tokens with filtering and pagination
   */
  async getDeviceTokens(
    options: GetDeviceTokensOptions = {}
  ): Promise<DeviceTokenWithUser[]> {
    try {
      const { userId, platform, isActive, limit = 50, offset = 0 } = options;

      const where: any = {};

      if (userId) where.userId = userId;
      if (platform) where.platform = platform;
      if (isActive !== undefined) where.isActive = isActive;

      const deviceTokens = await prisma.deviceToken.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { lastUsed: "desc" },
        take: limit,
        skip: offset,
      });

      return deviceTokens;
    } catch (error) {
      logger.error("Failed to get device tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Get device tokens for a specific user
   */
  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        orderBy: { lastUsed: "desc" },
      });

      return deviceTokens;
    } catch (error) {
      logger.error("Failed to get user device tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Get device tokens for a specific platform
   */
  async getPlatformDeviceTokens(platform: string): Promise<DeviceToken[]> {
    try {
      const deviceTokens = await prisma.deviceToken.findMany({
        where: {
          platform,
          isActive: true,
        },
        orderBy: { lastUsed: "desc" },
      });

      return deviceTokens;
    } catch (error) {
      logger.error("Failed to get platform device tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        platform,
      });
      throw error;
    }
  }

  /**
   * Update device token last used timestamp
   */
  async updateLastUsed(tokenId: string): Promise<DeviceToken> {
    try {
      const deviceToken = await prisma.deviceToken.update({
        where: { id: tokenId },
        data: { lastUsed: new Date() },
      });

      logger.info("Device token last used updated", { tokenId });
      return deviceToken;
    } catch (error) {
      logger.error("Failed to update device token last used", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenId,
      });
      throw error;
    }
  }

  /**
   * Deactivate a device token
   */
  async deactivateDeviceToken(tokenId: string): Promise<DeviceToken> {
    try {
      const deviceToken = await prisma.deviceToken.update({
        where: { id: tokenId },
        data: { isActive: false },
      });

      logger.info("Device token deactivated", { tokenId });
      return deviceToken;
    } catch (error) {
      logger.error("Failed to deactivate device token", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenId,
      });
      throw error;
    }
  }

  /**
   * Deactivate device token by token string
   */
  async deactivateDeviceTokenByToken(token: string): Promise<DeviceToken> {
    try {
      const deviceToken = await prisma.deviceToken.update({
        where: { token },
        data: { isActive: false },
      });

      logger.info("Device token deactivated by token", {
        tokenId: deviceToken.id,
        token: token.substring(0, 20) + "...", // Log partial token for security
      });
      return deviceToken;
    } catch (error) {
      logger.error("Failed to deactivate device token by token", {
        error: error instanceof Error ? error.message : "Unknown error",
        token: token.substring(0, 20) + "...", // Log partial token for security
      });
      throw error;
    }
  }

  /**
   * Deactivate all device tokens for a user
   */
  async deactivateUserDeviceTokens(userId: string): Promise<{ count: number }> {
    try {
      const result = await prisma.deviceToken.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: { isActive: false },
      });

      logger.info("All user device tokens deactivated", {
        userId,
        count: result.count,
      });

      return result;
    } catch (error) {
      logger.error("Failed to deactivate user device tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete a device token
   */
  async deleteDeviceToken(tokenId: string): Promise<DeviceToken> {
    try {
      const deviceToken = await prisma.deviceToken.delete({
        where: { id: tokenId },
      });

      logger.info("Device token deleted", { tokenId });
      return deviceToken;
    } catch (error) {
      logger.error("Failed to delete device token", {
        error: error instanceof Error ? error.message : "Unknown error",
        tokenId,
      });
      throw error;
    }
  }

  /**
   * Delete device token by token string
   */
  async deleteDeviceTokenByToken(token: string): Promise<DeviceToken> {
    try {
      const deviceToken = await prisma.deviceToken.delete({
        where: { token },
      });

      logger.info("Device token deleted by token", {
        tokenId: deviceToken.id,
        token: token.substring(0, 20) + "...", // Log partial token for security
      });
      return deviceToken;
    } catch (error) {
      logger.error("Failed to delete device token by token", {
        error: error instanceof Error ? error.message : "Unknown error",
        token: token.substring(0, 20) + "...", // Log partial token for security
      });
      throw error;
    }
  }

  /**
   * Clean up inactive device tokens
   */
  async cleanupInactiveTokens(daysInactive = 30): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysInactive * 24 * 60 * 60 * 1000
      );

      const result = await prisma.deviceToken.deleteMany({
        where: {
          isActive: false,
          lastUsed: { lt: cutoffDate },
        },
      });

      logger.info("Inactive device tokens cleaned up", {
        count: result.count,
        daysInactive,
        cutoffDate,
      });

      return result;
    } catch (error) {
      logger.error("Failed to cleanup inactive device tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        daysInactive,
      });
      throw error;
    }
  }

  /**
   * Get device token statistics
   */
  async getDeviceTokenStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPlatform: Record<string, number>;
    recentRegistrations: number;
  }> {
    try {
      const [total, active, inactive, byPlatform, recentRegistrations] =
        await Promise.all([
          prisma.deviceToken.count(),
          prisma.deviceToken.count({ where: { isActive: true } }),
          prisma.deviceToken.count({ where: { isActive: false } }),
          prisma.deviceToken.groupBy({
            by: ["platform"],
            _count: { platform: true },
          }),
          prisma.deviceToken.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          }),
        ]);

      const byPlatformMap = byPlatform.reduce((acc, item) => {
        acc[item.platform] = item._count.platform;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        active,
        inactive,
        byPlatform: byPlatformMap,
        recentRegistrations,
      };
    } catch (error) {
      logger.error("Failed to get device token stats", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Validate device token format
   */
  validateDeviceToken(token: string, platform: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    switch (platform) {
      case "ios":
        // iOS device tokens are typically 64 characters long
        return token.length === 64 && /^[a-fA-F0-9]+$/.test(token);

      case "android":
        // Android FCM tokens are typically longer and contain various characters
        return token.length > 100 && token.length < 200;

      case "web":
        // Web push tokens can vary in format
        return token.length > 50;

      default:
        return false;
    }
  }

  /**
   * Get device token by token string
   */
  async getDeviceTokenByToken(token: string): Promise<DeviceToken | null> {
    try {
      const deviceToken = await prisma.deviceToken.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return deviceToken;
    } catch (error) {
      logger.error("Failed to get device token by token", {
        error: error instanceof Error ? error.message : "Unknown error",
        token: token.substring(0, 20) + "...", // Log partial token for security
      });
      throw error;
    }
  }

  /**
   * Check if user has active device tokens
   */
  async hasActiveTokens(userId: string): Promise<boolean> {
    try {
      const count = await prisma.deviceToken.count({
        where: {
          userId,
          isActive: true,
        },
      });

      return count > 0;
    } catch (error) {
      logger.error("Failed to check if user has active tokens", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const deviceTokenService = new DeviceTokenService();
