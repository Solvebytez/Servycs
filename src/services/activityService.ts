import { prisma } from "@/config/database";
import { ActivityType, Activity, User, Salesman, Vendor } from "@prisma/client";
import { logger } from "@/utils/logger";

export interface CreateActivityData {
  type: ActivityType;
  actorId?: string;
  targetId?: string;
  salesmanId?: string;
  vendorId?: string;
  userId?: string;
  metadata?: any;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface ActivityWithRelations extends Activity {
  actor?: {
    id: string;
    name: string;
    email: string;
    primaryCity: string | null;
    role: string;
  } | null;
  target?: {
    id: string;
    name: string;
    email: string;
    primaryCity: string | null;
    role: string;
  } | null;
  salesman?: {
    id: string;
    territory: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  vendor?: {
    id: string;
    businessName: string;
    businessEmail: string;
    user: {
      name: string;
      primaryCity: string | null;
    };
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    primaryCity: string | null;
    role: string;
  } | null;
}

export interface GetActivitiesOptions {
  salesmanId?: string;
  vendorId?: string;
  userId?: string;
  type?: ActivityType;
  isRead?: boolean;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    try {
      const activity = await prisma.activity.create({
        data: {
          type: data.type,
          actorId: data.actorId,
          targetId: data.targetId,
          salesmanId: data.salesmanId,
          vendorId: data.vendorId,
          userId: data.userId,
          metadata: data.metadata || {},
          priority: data.priority || "NORMAL",
        },
      });

      logger.info("Activity created successfully", {
        activityId: activity.id,
        type: activity.type,
        actorId: activity.actorId,
        targetId: activity.targetId,
      });

      return activity;
    } catch (error) {
      logger.error("Failed to create activity", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  /**
   * Get activities with filtering and pagination
   */
  async getActivities(
    options: GetActivitiesOptions = {}
  ): Promise<ActivityWithRelations[]> {
    try {
      const {
        salesmanId,
        vendorId,
        userId,
        type,
        isRead,
        limit = 20,
        offset = 0,
        startDate,
        endDate,
      } = options;

      const where: any = {};

      if (salesmanId) where.salesmanId = salesmanId;
      if (vendorId) where.vendorId = vendorId;
      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const activities = await prisma.activity.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              primaryCity: true,
              role: true,
            },
          },
          target: {
            select: {
              id: true,
              name: true,
              email: true,
              primaryCity: true,
              role: true,
            },
          },
          salesman: {
            select: {
              id: true,
              territory: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
              user: {
                select: {
                  name: true,
                  primaryCity: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              primaryCity: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return activities;
    } catch (error) {
      logger.error("Failed to get activities", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Get activities for salesman dashboard
   */
  async getSalesmanActivities(
    salesmanId: string,
    limit = 10
  ): Promise<ActivityWithRelations[]> {
    return this.getActivities({
      salesmanId,
      limit,
    });
  }

  /**
   * Get activities for vendor dashboard
   */
  async getVendorActivities(
    vendorId: string,
    limit = 10
  ): Promise<ActivityWithRelations[]> {
    return this.getActivities({
      vendorId,
      limit,
    });
  }

  /**
   * Get activities for user dashboard
   */
  async getUserActivities(
    userId: string,
    limit = 10
  ): Promise<ActivityWithRelations[]> {
    return this.getActivities({
      userId,
      limit,
    });
  }

  /**
   * Mark activity as read
   */
  async markAsRead(activityId: string): Promise<Activity> {
    try {
      const activity = await prisma.activity.update({
        where: { id: activityId },
        data: { isRead: true },
      });

      logger.info("Activity marked as read", { activityId });
      return activity;
    } catch (error) {
      logger.error("Failed to mark activity as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        activityId,
      });
      throw error;
    }
  }

  /**
   * Mark multiple activities as read
   */
  async markMultipleAsRead(activityIds: string[]): Promise<{ count: number }> {
    try {
      const result = await prisma.activity.updateMany({
        where: { id: { in: activityIds } },
        data: { isRead: true },
      });

      logger.info("Multiple activities marked as read", {
        count: result.count,
        activityIds,
      });

      return result;
    } catch (error) {
      logger.error("Failed to mark multiple activities as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        activityIds,
      });
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(options: {
    salesmanId?: string;
    vendorId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recentCount: number;
  }> {
    try {
      const { salesmanId, vendorId, userId, startDate, endDate } = options;

      const where: any = {};
      if (salesmanId) where.salesmanId = salesmanId;
      if (vendorId) where.vendorId = vendorId;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [total, unread, byType, recentCount] = await Promise.all([
        prisma.activity.count({ where }),
        prisma.activity.count({ where: { ...where, isRead: false } }),
        prisma.activity.groupBy({
          by: ["type"],
          where,
          _count: { type: true },
        }),
        prisma.activity.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      const byTypeMap = byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        unread,
        byType: byTypeMap,
        recentCount,
      };
    } catch (error) {
      logger.error("Failed to get activity stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Delete old activities (cleanup)
   */
  async deleteOldActivities(daysOld = 90): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await prisma.activity.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isRead: true, // Only delete read activities
        },
      });

      logger.info("Old activities deleted", {
        count: result.count,
        daysOld,
        cutoffDate,
      });

      return result;
    } catch (error) {
      logger.error("Failed to delete old activities", {
        error: error instanceof Error ? error.message : "Unknown error",
        daysOld,
      });
      throw error;
    }
  }

  /**
   * Helper method to format time ago
   */
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  /**
   * Helper method to get activity display text
   */
  getActivityDisplayText(activity: ActivityWithRelations): string {
    const { type, actor, target, vendor, user } = activity;

    switch (type) {
      case ActivityType.USER_SIGNUP:
        return `${actor?.name || "User"} signed up`;
      case ActivityType.VENDOR_SIGNUP:
        return `${vendor?.businessName || "Vendor"} signed up`;
      case ActivityType.BOOKING_CREATED:
        return `New booking created by ${actor?.name || "User"}`;
      case ActivityType.ENQUIRY_CREATED:
        return `New enquiry from ${actor?.name || "User"}`;
      case ActivityType.REVIEW_POSTED:
        return `New review posted by ${actor?.name || "User"}`;
      case ActivityType.PAYMENT_COMPLETED:
        return `Payment completed by ${actor?.name || "User"}`;
      default:
        return `${type.replace(/_/g, " ").toLowerCase()}`;
    }
  }
}

// Export singleton instance
export const activityService = new ActivityService();
