import { prisma } from "@/config/database";
import { NotificationType, Notification, User, Activity } from "@prisma/client";
import { logger } from "@/utils/logger";
import { deviceTokenService } from "./deviceTokenService";

export interface CreateNotificationData {
  userId: string;
  activityId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

export interface NotificationWithRelations extends Notification {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  activity?: {
    id: string;
    type: string;
    metadata: any;
    createdAt: Date;
  } | null;
}

export interface GetNotificationsOptions {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  isSent?: boolean;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(
    data: CreateNotificationData
  ): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          activityId: data.activityId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data || {},
        },
      });

      logger.info("Notification created successfully", {
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type,
      });

      return notification;
    } catch (error) {
      logger.error("Failed to create notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  /**
   * Get notifications with filtering and pagination
   */
  async getNotifications(
    options: GetNotificationsOptions = {}
  ): Promise<NotificationWithRelations[]> {
    try {
      const {
        userId,
        type,
        isRead,
        isSent,
        limit = 20,
        offset = 0,
        startDate,
        endDate,
      } = options;

      const where: any = {};

      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;
      if (isSent !== undefined) where.isSent = isSent;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const notifications = await prisma.notification.findMany({
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
          activity: {
            select: {
              id: true,
              type: true,
              metadata: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      logger.error("Failed to get notifications", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(
    userId: string,
    limit = 20
  ): Promise<NotificationWithRelations[]> {
    return this.getNotifications({
      userId,
      limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info("Notification marked as read", { notificationId });
      return notification;
    } catch (error) {
      logger.error("Failed to mark notification as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationId,
      });
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(
    notificationIds: string[]
  ): Promise<{ count: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info("Multiple notifications marked as read", {
        count: result.count,
        notificationIds,
      });

      return result;
    } catch (error) {
      logger.error("Failed to mark multiple notifications as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        notificationIds,
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info("All notifications marked as read for user", {
        userId,
        count: result.count,
      });

      return result;
    } catch (error) {
      logger.error("Failed to mark all notifications as read", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Send push notification to user's devices
   */
  async sendPushNotification(
    userId: string,
    notification: NotificationTemplate
  ): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    try {
      // Get user's active device tokens
      const deviceTokens = await deviceTokenService.getUserDeviceTokens(userId);

      if (deviceTokens.length === 0) {
        logger.warn("No device tokens found for user", { userId });
        return {
          success: false,
          sentCount: 0,
          errors: ["No device tokens found"],
        };
      }

      const errors: string[] = [];
      let sentCount = 0;

      // Send to each device token
      for (const deviceToken of deviceTokens) {
        try {
          // TODO: Implement actual push notification sending
          // This would integrate with FCM/APNS
          await this.sendToDevice(
            deviceToken.token,
            deviceToken.platform,
            notification
          );
          sentCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(
            `Failed to send to device ${deviceToken.id}: ${errorMessage}`
          );
          logger.error("Failed to send push notification to device", {
            deviceTokenId: deviceToken.id,
            userId,
            error: errorMessage,
          });
        }
      }

      const success = sentCount > 0;

      logger.info("Push notification sending completed", {
        userId,
        sentCount,
        totalDevices: deviceTokens.length,
        errors: errors.length,
      });

      return { success, sentCount, errors };
    } catch (error) {
      logger.error("Failed to send push notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Send notification to specific device (placeholder for FCM/APNS integration)
   */
  private async sendToDevice(
    token: string,
    platform: string,
    notification: NotificationTemplate
  ): Promise<void> {
    // TODO: Implement actual push notification sending
    // This would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNS) for iOS
    // - Web Push API for web browsers

    logger.info("Sending push notification to device", {
      token: token.substring(0, 20) + "...", // Log partial token for security
      platform,
      title: notification.title,
    });

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Process and send notification from activity
   */
  async processActivityNotification(activityId: string): Promise<void> {
    try {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
          actor: true,
          target: true,
          salesman: { include: { user: true } },
          vendor: { include: { user: true } },
          user: true,
        },
      });

      if (!activity) {
        logger.warn("Activity not found for notification processing", {
          activityId,
        });
        return;
      }

      // Determine notification recipients and content based on activity type
      const notifications = await this.generateNotificationsFromActivity(
        activity
      );

      // Create and send notifications
      for (const notificationData of notifications) {
        const notification = await this.createNotification(notificationData);

        // Send push notification
        await this.sendPushNotification(notificationData.userId, {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
        });

        // Mark as sent
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            isSent: true,
            sentAt: new Date(),
          },
        });
      }

      logger.info("Activity notification processed successfully", {
        activityId,
        notificationsSent: notifications.length,
      });
    } catch (error) {
      logger.error("Failed to process activity notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        activityId,
      });
      throw error;
    }
  }

  /**
   * Generate notification data from activity
   */
  private async generateNotificationsFromActivity(
    activity: any
  ): Promise<CreateNotificationData[]> {
    const notifications: CreateNotificationData[] = [];

    switch (activity.type) {
      case "USER_SIGNUP":
        if (activity.salesmanId) {
          notifications.push({
            userId: activity.salesman.userId,
            activityId: activity.id,
            type: "NEW_USER_ONBOARDED",
            title: "New User Onboarded",
            body: `${
              activity.actor?.name || "A user"
            } signed up in your territory`,
            data: {
              userId: activity.actorId,
              userName: activity.actor?.name,
              userCity: activity.actor?.primaryCity,
            },
          });
        }
        break;

      case "VENDOR_SIGNUP":
        if (activity.salesmanId) {
          notifications.push({
            userId: activity.salesman.userId,
            activityId: activity.id,
            type: "NEW_VENDOR_ONBOARDED",
            title: "New Vendor Onboarded",
            body: `${
              activity.vendor?.businessName || "A vendor"
            } signed up in your territory`,
            data: {
              vendorId: activity.vendorId,
              businessName: activity.vendor?.businessName,
              businessCity: activity.vendor?.user?.primaryCity,
            },
          });
        }
        break;

      case "BOOKING_CREATED":
        if (activity.vendorId) {
          notifications.push({
            userId: activity.vendor.userId,
            activityId: activity.id,
            type: "NEW_BOOKING_REQUEST",
            title: "New Booking Request",
            body: `You have a new booking request from ${
              activity.actor?.name || "a customer"
            }`,
            data: {
              bookingId: activity.metadata?.bookingId,
              customerName: activity.actor?.name,
              amount: activity.metadata?.amount,
            },
          });
        }
        break;

      case "ENQUIRY_CREATED":
        if (activity.vendorId) {
          notifications.push({
            userId: activity.vendor.userId,
            activityId: activity.id,
            type: "NEW_ENQUIRY_RECEIVED",
            title: "New Enquiry Received",
            body: `You have a new enquiry from ${
              activity.actor?.name || "a customer"
            }`,
            data: {
              enquiryId: activity.metadata?.enquiryId,
              customerName: activity.actor?.name,
              message: activity.metadata?.message,
            },
          });
        }
        break;

      case "REVIEW_POSTED":
        if (activity.vendorId) {
          notifications.push({
            userId: activity.vendor.userId,
            activityId: activity.id,
            type: "NEW_REVIEW_RECEIVED",
            title: "New Review Received",
            body: `You received a ${
              activity.metadata?.rating || 5
            }-star review from ${activity.actor?.name || "a customer"}`,
            data: {
              reviewId: activity.metadata?.reviewId,
              customerName: activity.actor?.name,
              rating: activity.metadata?.rating,
            },
          });
        }
        break;

      // Add more cases as needed
    }

    return notifications;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(options: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    unread: number;
    sent: number;
    delivered: number;
    byType: Record<string, number>;
  }> {
    try {
      const { userId, startDate, endDate } = options;

      const where: any = {};
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [total, unread, sent, delivered, byType] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { ...where, isRead: false } }),
        prisma.notification.count({ where: { ...where, isSent: true } }),
        prisma.notification.count({ where: { ...where, isDelivered: true } }),
        prisma.notification.groupBy({
          by: ["type"],
          where,
          _count: { type: true },
        }),
      ]);

      const byTypeMap = byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        unread,
        sent,
        delivered,
        byType: byTypeMap,
      };
    } catch (error) {
      logger.error("Failed to get notification stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(daysOld = 30): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isRead: true, // Only delete read notifications
        },
      });

      logger.info("Old notifications deleted", {
        count: result.count,
        daysOld,
        cutoffDate,
      });

      return result;
    } catch (error) {
      logger.error("Failed to delete old notifications", {
        error: error instanceof Error ? error.message : "Unknown error",
        daysOld,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
