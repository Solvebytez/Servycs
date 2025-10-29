import { prisma } from "@/config/database";
import { Enquiry, EnquiryChannel, EnquiryStatus } from "@prisma/client";
import { logger } from "@/utils/logger";
import { activityService } from "./activityService";
import { notificationService } from "./notificationService";

export interface CreateEnquiryData {
  vendorId: string;
  listingId: string;
  serviceId?: string;
  userId: string;
  channel: EnquiryChannel;
  message?: string;
}

export interface EnquiryWithRelations extends Enquiry {
  vendor?: {
    id: string;
    businessName: string;
    businessEmail: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  listing?: {
    id: string;
    title: string;
    description: string;
  } | null;
  service?: {
    id: string;
    name: string;
    description: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface GetEnquiriesOptions {
  vendorId?: string;
  userId?: string;
  listingId?: string;
  status?: EnquiryStatus;
  channel?: EnquiryChannel;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export class EnquiryService {
  /**
   * Create a new enquiry
   */
  async createEnquiry(data: CreateEnquiryData): Promise<EnquiryWithRelations> {
    try {
      // Create enquiry record
      const enquiry = await prisma.enquiry.create({
        data: {
          vendorId: data.vendorId,
          listingId: data.listingId,
          serviceId: data.serviceId,
          userId: data.userId,
          channel: data.channel,
          message: data.message,
          status: EnquiryStatus.PENDING, // Start as PENDING, will be updated to ACTIVE
        },
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update status to ACTIVE for immediate tracking
      const updatedEnquiry = await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { status: EnquiryStatus.PENDING }, // Keep as PENDING for now, will change to ACTIVE
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create activity record
      await activityService.createActivity({
        type: "ENQUIRY_CREATED",
        actorId: data.userId,
        vendorId: data.vendorId,
        userId: data.userId,
        metadata: {
          enquiryId: enquiry.id,
          listingId: data.listingId,
          serviceId: data.serviceId,
          channel: data.channel,
          message: data.message,
        },
      });

      // Create notification for vendor
      if (updatedEnquiry.vendor?.user?.id) {
        await notificationService.createNotification({
          userId: updatedEnquiry.vendor.user.id,
          type: "NEW_ENQUIRY_RECEIVED",
          title: "New Enquiry Received",
          body: `${
            updatedEnquiry.user?.name || "A user"
          } is interested in your service: ${
            updatedEnquiry.listing?.title || "Service"
          }`,
          data: {
            enquiryId: enquiry.id,
            listingId: data.listingId,
            channel: data.channel,
          },
        });
      }

      logger.info("Enquiry created successfully", {
        enquiryId: enquiry.id,
        vendorId: data.vendorId,
        userId: data.userId,
        channel: data.channel,
      });

      return updatedEnquiry;
    } catch (error) {
      logger.error("Failed to create enquiry", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  /**
   * Get enquiries with filtering and pagination
   */
  async getEnquiries(
    options: GetEnquiriesOptions = {}
  ): Promise<EnquiryWithRelations[]> {
    try {
      const {
        vendorId,
        userId,
        listingId,
        status,
        channel,
        limit = 20,
        offset = 0,
        startDate,
        endDate,
      } = options;

      const where: any = {};

      if (vendorId) where.vendorId = vendorId;
      if (userId) where.userId = userId;
      if (listingId) where.listingId = listingId;
      if (status) where.status = status;
      if (channel) where.channel = channel;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const enquiries = await prisma.enquiry.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return enquiries;
    } catch (error) {
      logger.error("Failed to get enquiries", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }

  /**
   * Get enquiries for a specific vendor
   */
  async getVendorEnquiries(
    vendorId: string,
    options: Omit<GetEnquiriesOptions, "vendorId"> = {}
  ): Promise<EnquiryWithRelations[]> {
    return this.getEnquiries({ ...options, vendorId });
  }

  /**
   * Get enquiries for a specific user
   */
  async getUserEnquiries(
    userId: string,
    options: Omit<GetEnquiriesOptions, "userId"> = {}
  ): Promise<EnquiryWithRelations[]> {
    return this.getEnquiries({ ...options, userId });
  }

  /**
   * Update enquiry status
   */
  async updateEnquiryStatus(
    enquiryId: string,
    status: EnquiryStatus
  ): Promise<EnquiryWithRelations> {
    try {
      const enquiry = await prisma.enquiry.update({
        where: { id: enquiryId },
        data: { status },
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create activity for status change
      await activityService.createActivity({
        type:
          status === EnquiryStatus.RESPONDED
            ? "ENQUIRY_RESPONDED"
            : "ENQUIRY_CLOSED",
        actorId: enquiry.vendor?.user?.id,
        vendorId: enquiry.vendorId,
        userId: enquiry.userId,
        metadata: {
          enquiryId: enquiry.id,
          oldStatus: EnquiryStatus.PENDING,
          newStatus: status,
        },
      });

      logger.info("Enquiry status updated", {
        enquiryId,
        status,
      });

      return enquiry;
    } catch (error) {
      logger.error("Failed to update enquiry status", {
        error: error instanceof Error ? error.message : "Unknown error",
        enquiryId,
        status,
      });
      throw error;
    }
  }

  /**
   * Get enquiry statistics
   */
  async getEnquiryStats(options: {
    vendorId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    pending: number;
    responded: number;
    closed: number;
    byChannel: Record<string, number>;
  }> {
    try {
      const { vendorId, userId, startDate, endDate } = options;

      const where: any = {};
      if (vendorId) where.vendorId = vendorId;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [total, pending, responded, closed, byChannel] = await Promise.all([
        prisma.enquiry.count({ where }),
        prisma.enquiry.count({
          where: { ...where, status: EnquiryStatus.PENDING },
        }),
        prisma.enquiry.count({
          where: { ...where, status: EnquiryStatus.RESPONDED },
        }),
        prisma.enquiry.count({
          where: { ...where, status: EnquiryStatus.CLOSED },
        }),
        prisma.enquiry.groupBy({
          by: ["channel"],
          where,
          _count: { channel: true },
        }),
      ]);

      const byChannelMap = byChannel.reduce((acc, item) => {
        acc[item.channel] = item._count.channel;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        pending,
        responded,
        closed,
        byChannel: byChannelMap,
      };
    } catch (error) {
      logger.error("Failed to get enquiry stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        options,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const enquiryService = new EnquiryService();
