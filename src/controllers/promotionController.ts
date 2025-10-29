import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import { deleteFromCloudinary, extractPublicId } from "../utils/upload";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

// Types for promotion creation
interface CreatePromotionRequest {
  title: string;
  serviceListingIds: string[];
  discountType: "percentage" | "fixed";
  discountValue: number;
  originalPrice?: number;
  startDate: string;
  endDate: string;
  bannerImage?: string;
}

interface PromotionResponse {
  id: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  originalPrice?: number | null;
  startDate: string;
  endDate: string;
  bannerImage?: string | null;
  status: string;
  isPromotionOn: boolean;
  serviceListings: {
    id: string;
    title: string;
    categoryPath: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

// Create a new promotion
export const createPromotion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | undefined> => {
  try {
    // DEBUG: Log controller data
    console.log("🎯 CONTROLLER DEBUG - Promotion creation started:");
    console.log("User ID:", req.user?.id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    // Look up the vendor record
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const vendorId = vendor.id;

    const {
      title,
      serviceListingIds,
      discountType,
      discountValue,
      originalPrice,
      startDate,
      endDate,
      bannerImage,
    }: CreatePromotionRequest = req.body;

    // Validate required fields
    console.log("🔍 CONTROLLER DEBUG - Validating required fields:");
    console.log("title:", title);
    console.log("serviceListingIds:", serviceListingIds);
    console.log("discountType:", discountType);
    console.log("discountValue:", discountValue);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("bannerImage:", bannerImage);

    if (
      !title ||
      !serviceListingIds ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate
    ) {
      console.log("❌ CONTROLLER DEBUG - Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("✅ CONTROLLER DEBUG - Required fields validation passed");

    // Validate service listings belong to the vendor
    console.log("🔍 CONTROLLER DEBUG - Validating service listings:");
    console.log("Looking for serviceListingIds:", serviceListingIds);
    console.log("Vendor ID:", vendorId);

    const serviceListings = await prisma.serviceListing.findMany({
      where: {
        id: { in: serviceListingIds },
        vendorId: vendorId,
        status: "ACTIVE", // Only allow promotions for active services
      },
      select: {
        id: true,
        title: true,
        categoryPath: true,
        status: true,
      },
    });

    console.log("Found service listings:", serviceListings);
    console.log("Expected count:", serviceListingIds.length);
    console.log("Found count:", serviceListings.length);

    if (serviceListings.length !== serviceListingIds.length) {
      console.log("❌ CONTROLLER DEBUG - Service listing validation failed");
      return res.status(400).json({
        success: false,
        message: "Some service listings are invalid or not owned by you",
      });
    }

    console.log("✅ CONTROLLER DEBUG - Service listing validation passed");

    // Date validation is already handled by the validator middleware
    console.log(
      "✅ CONTROLLER DEBUG - Date validation passed (handled by validator)"
    );

    // Convert dates for database storage
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate discount values
    if (
      discountType === "percentage" &&
      (discountValue < 1 || discountValue > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 1-100",
      });
    }

    if (discountType === "fixed" && discountValue < 1) {
      return res.status(400).json({
        success: false,
        message: "Fixed discount must be greater than 0",
      });
    }

    if (
      discountType === "fixed" &&
      originalPrice &&
      originalPrice <= discountValue
    ) {
      return res.status(400).json({
        success: false,
        message: "Original price must be greater than discount amount",
      });
    }

    // Create promotion description
    const description = `Special promotion: ${
      discountType === "percentage"
        ? `${discountValue}% off`
        : `$${discountValue} off`
    } on selected services`;

    console.log(
      "🔍 CONTROLLER DEBUG - Creating promotion with isActive: false (pending by default)"
    );
    console.log("🔍 CONTROLLER DEBUG - bannerImage to be saved:", bannerImage);

    // Create the promotion
    const promotion = await prisma.promotion.create({
      data: {
        vendorId,
        title,
        description,
        discountType: discountType.toUpperCase(),
        discountValue,
        originalPrice,
        startDate: start,
        endDate: end,
        bannerImage,
        status: "PENDING",
        isPromotionOn: false,
      },
      include: {
        vendor: {
          select: {
            businessName: true,
          },
        },
      },
    });

    console.log(
      "🔍 CONTROLLER DEBUG - Created promotion bannerImage:",
      promotion.bannerImage
    );

    // Create promotion-service listing relationships
    await prisma.promotionServiceListing.createMany({
      data: serviceListingIds.map((listingId) => ({
        promotionId: promotion.id,
        serviceListingId: listingId,
      })),
    });

    // Prepare response
    const response: PromotionResponse = {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      originalPrice: promotion.originalPrice,
      startDate: promotion.startDate.toISOString(),
      endDate: promotion.endDate.toISOString(),
      bannerImage: promotion.bannerImage,
      status: promotion.status,
      isPromotionOn: promotion.isPromotionOn,
      serviceListings: serviceListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        categoryPath: listing.categoryPath,
      })),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    logger.info(
      `Promotion created successfully: ${promotion.id} by vendor: ${vendorId}`
    );

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: response,
    });
  } catch (error) {
    logger.error("Error creating promotion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  return;
};

// Get a single promotion by ID
export const getPromotionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | undefined> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const vendorId = vendor.id;
    const { id } = req.params;

    // Get the promotion with service listings
    const promotion = await prisma.promotion.findFirst({
      where: {
        id,
        vendorId, // Ensure the promotion belongs to this vendor
      },
      include: {
        vendor: {
          select: {
            businessName: true,
          },
        },
        serviceListings: {
          include: {
            serviceListing: {
              select: {
                id: true,
                title: true,
                categoryPath: true,
              },
            },
          },
        },
      },
    });

    if (!promotion) {
      console.log("❌ GET PROMOTION BY ID - Promotion not found");
      return res.status(404).json({
        success: false,
        message: "Promotion not found or access denied",
      });
    }

    console.log("✅ GET PROMOTION BY ID - Promotion found:");
    console.log("Promotion ID:", promotion.id);
    console.log("Promotion title:", promotion.title);
    console.log(
      "Service listings count:",
      promotion.serviceListings?.length || 0
    );
    console.log("Service listings:", promotion.serviceListings);

    // Prepare response
    const response: PromotionResponse = {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      originalPrice: promotion.originalPrice,
      startDate: promotion.startDate.toISOString(),
      endDate: promotion.endDate.toISOString(),
      bannerImage: promotion.bannerImage,
      status: promotion.status,
      isPromotionOn: promotion.isPromotionOn,
      serviceListings: promotion.serviceListings.map((psl) => ({
        id: psl.serviceListing.id,
        title: psl.serviceListing.title,
        categoryPath: psl.serviceListing.categoryPath,
      })),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    console.log("🔄 GET PROMOTION BY ID - Final response:");
    console.log("Response service listings:", response.serviceListings);
    console.log(
      "Response service listings length:",
      response.serviceListings.length
    );

    logger.info(`Promotion retrieved: ${promotion.id} by vendor: ${vendorId}`);

    res.status(200).json({
      success: true,
      message: "Promotion retrieved successfully",
      data: response,
    });
  } catch (error) {
    logger.error("Error retrieving promotion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  return;
};

// Get vendor's promotions
export const getVendorPromotions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | undefined> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const vendorId = vendor.id;

    console.log("🔍 GET PROMOTIONS DEBUG - Vendor lookup:");
    console.log("User ID:", userId);
    console.log("Vendor ID:", vendorId);
    console.log("Vendor business name:", vendor.businessName);

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { vendorId };
    if (status && typeof status === "string") {
      where.status = status.toUpperCase();
    }

    console.log("🔍 GET PROMOTIONS DEBUG - Query parameters:");
    console.log("Page:", page, "Limit:", limit, "Status:", status);
    console.log("Where clause:", where);

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          serviceListings: {
            include: {
              serviceListing: {
                select: {
                  id: true,
                  title: true,
                  categoryPath: true,
                },
              },
            },
          },
        },
      }),
      prisma.promotion.count({ where }),
    ]);

    const response = promotions.map((promotion) => ({
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      originalPrice: promotion.originalPrice,
      startDate: promotion.startDate.toISOString(),
      endDate: promotion.endDate.toISOString(),
      bannerImage: promotion.bannerImage,
      status: promotion.status,
      isPromotionOn: promotion.isPromotionOn,
      serviceListings: promotion.serviceListings.map((psl) => ({
        id: psl.serviceListing.id,
        title: psl.serviceListing.title,
        categoryPath: psl.serviceListing.categoryPath,
      })),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: response,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCount: total,
        hasNextPage: skip + Number(limit) < total,
        hasPreviousPage: Number(page) > 1,
      },
    });
  } catch (error) {
    logger.error("Error fetching vendor promotions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  return;
};

// Update promotion
export const updatePromotion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | undefined> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const vendorId = vendor.id;
    const { id } = req.params;

    // Check if promotion exists and belongs to vendor
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        id,
        vendorId,
      },
    });

    if (!existingPromotion) {
      return res.status(404).json({
        success: false,
        message:
          "Promotion not found or you don't have permission to update it",
      });
    }

    const {
      title,
      serviceListingIds,
      discountType,
      discountValue,
      originalPrice,
      startDate,
      endDate,
      bannerImage,
      status,
      isPromotionOn,
    } = req.body;

    // DEBUG: Log update data
    console.log(
      "🔄 UPDATE PROMOTION DEBUG - Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "🔄 UPDATE PROMOTION DEBUG - bannerImage received:",
      bannerImage
    );

    // Prepare update data with flexible partial updates
    const updateData: any = {};

    // Only include fields that are provided (allowing partial updates)
    if (title !== undefined) updateData.title = title;
    if (discountType !== undefined)
      updateData.discountType = discountType.toUpperCase();
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (bannerImage !== undefined) {
      updateData.bannerImage = bannerImage;
      console.log(
        "🔄 UPDATE PROMOTION DEBUG - Setting bannerImage in updateData:",
        bannerImage
      );
    }
    if (status !== undefined) updateData.status = status.toUpperCase();

    // Handle isPromotionOn toggle with business logic validation
    if (isPromotionOn !== undefined) {
      console.log(
        "🔄 TOGGLE PROMOTION - Current status:",
        existingPromotion.status
      );
      console.log(
        "🔄 TOGGLE PROMOTION - Current isPromotionOn:",
        existingPromotion.isPromotionOn
      );
      console.log("🔄 TOGGLE PROMOTION - New isPromotionOn:", isPromotionOn);

      // Only allow toggling for ACTIVE promotions
      if (existingPromotion.status !== "ACTIVE") {
        console.log("❌ TOGGLE PROMOTION - Rejected: Promotion is not ACTIVE");
        return res.status(400).json({
          success: false,
          message: "Only ACTIVE promotions can be turned on/off",
        });
      }
      updateData.isPromotionOn = isPromotionOn;
      console.log(
        "✅ TOGGLE PROMOTION - Approved: Updating isPromotionOn to",
        isPromotionOn
      );
    }

    // Validate dates if both are provided
    if (startDate !== undefined && endDate !== undefined) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
    }

    // Validate single date updates against existing data
    if (startDate !== undefined && endDate === undefined) {
      const start = new Date(startDate);
      const existingEnd = new Date(existingPromotion.endDate);

      if (start >= existingEnd) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before the existing end date",
        });
      }
    }

    if (endDate !== undefined && startDate === undefined) {
      const end = new Date(endDate);
      const existingStart = new Date(existingPromotion.startDate);

      if (end <= existingStart) {
        return res.status(400).json({
          success: false,
          message: "End date must be after the existing start date",
        });
      }
    }

    // DEBUG: Log final update data
    console.log(
      "🔄 UPDATE PROMOTION DEBUG - Final updateData:",
      JSON.stringify(updateData, null, 2)
    );

    // Update promotion with flexible data
    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    console.log(
      "🔄 UPDATE PROMOTION DEBUG - Updated promotion bannerImage:",
      updatedPromotion.bannerImage
    );

    // Update service listings if provided
    if (serviceListingIds) {
      // Delete existing relationships
      await prisma.promotionServiceListing.deleteMany({
        where: { promotionId: id },
      });

      // Create new relationships
      await prisma.promotionServiceListing.createMany({
        data: serviceListingIds.map((listingId: string) => ({
          promotionId: id,
          serviceListingId: listingId,
        })),
      });
    }

    // Fetch the complete updated promotion with service listings
    const completePromotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            businessName: true,
          },
        },
        serviceListings: {
          include: {
            serviceListing: {
              select: {
                id: true,
                title: true,
                categoryPath: true,
              },
            },
          },
        },
      },
    });

    if (!completePromotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found after update",
      });
    }

    // Prepare response with complete data
    const response: PromotionResponse = {
      id: completePromotion.id,
      title: completePromotion.title,
      description: completePromotion.description,
      discountType: completePromotion.discountType,
      discountValue: completePromotion.discountValue,
      originalPrice: completePromotion.originalPrice,
      startDate: completePromotion.startDate.toISOString(),
      endDate: completePromotion.endDate.toISOString(),
      bannerImage: completePromotion.bannerImage,
      status: completePromotion.status,
      isPromotionOn: completePromotion.isPromotionOn,
      serviceListings: completePromotion.serviceListings.map((psl) => ({
        id: psl.serviceListing.id,
        title: psl.serviceListing.title,
        categoryPath: psl.serviceListing.categoryPath,
      })),
      createdAt: completePromotion.createdAt.toISOString(),
      updatedAt: completePromotion.updatedAt.toISOString(),
    };

    console.log(
      "🔄 BACKEND UPDATE RESPONSE - Complete promotion data:",
      response
    );
    console.log(
      "🔄 BACKEND UPDATE RESPONSE - Service listings:",
      response.serviceListings
    );

    console.log("✅ UPDATE PROMOTION - Sending response:");
    console.log("Response data:", JSON.stringify(response, null, 2));

    logger.info(`Promotion updated successfully: ${id} by vendor: ${vendorId}`);

    res.json({
      success: true,
      message: "Promotion updated successfully",
      data: response,
    });
  } catch (error) {
    console.log("❌ UPDATE PROMOTION - Error occurred:", error);
    logger.error("Error updating promotion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  return;
};

// Delete promotion
export const deletePromotion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | undefined> => {
  try {
    console.log("🗑️ DELETE PROMOTION - Request received:");
    console.log("🗑️ DELETE PROMOTION - URL:", req.url);
    console.log("🗑️ DELETE PROMOTION - Method:", req.method);
    console.log("🗑️ DELETE PROMOTION - Params:", req.params);
    console.log("🗑️ DELETE PROMOTION - User:", req.user);

    const userId = req.user?.id;
    if (!userId) {
      console.log("❌ DELETE PROMOTION - No user ID found");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    // Look up the vendor record
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      console.log("❌ DELETE PROMOTION - User is not a vendor");
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const vendorId = vendor.id;
    const { id } = req.params;

    console.log(
      "🔍 DELETE PROMOTION - Looking for promotion:",
      id,
      "by vendor:",
      vendorId
    );

    // Check if promotion exists and belongs to vendor
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        id,
        vendorId,
      },
    });

    if (!existingPromotion) {
      console.log("❌ DELETE PROMOTION - Promotion not found or access denied");
      return res.status(404).json({
        success: false,
        message:
          "Promotion not found or you don't have permission to delete it",
      });
    }

    console.log(
      "✅ DELETE PROMOTION - Promotion found, proceeding with deletion"
    );

    // Delete banner image from Cloudinary if it exists
    if (existingPromotion.bannerImage) {
      try {
        console.log(
          "🗑️ DELETE PROMOTION - Deleting banner image from Cloudinary:",
          existingPromotion.bannerImage
        );
        const publicId = extractPublicId(existingPromotion.bannerImage);
        await deleteFromCloudinary(publicId);
        console.log(
          "✅ DELETE PROMOTION - Banner image deleted from Cloudinary successfully"
        );
      } catch (imageDeleteError) {
        console.error(
          "⚠️ DELETE PROMOTION - Failed to delete banner image from Cloudinary:",
          imageDeleteError
        );
        // Continue with promotion deletion even if image deletion fails
      }
    }

    // Delete promotion (cascade will handle related records)
    await prisma.promotion.delete({
      where: { id },
    });

    console.log("✅ DELETE PROMOTION - Promotion deleted successfully");
    logger.info(`Promotion deleted successfully: ${id} by vendor: ${vendorId}`);

    res.json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting promotion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  return;
};

// Get active promotions for banner slider (public endpoint)
export const getActivePromotions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const { excludeUserId } = req.query;

    console.log("🎯 BACKEND DEBUG - getActivePromotions called");
    console.log("🎯 BACKEND DEBUG - excludeUserId:", excludeUserId);
    console.log("🎯 BACKEND DEBUG - excludeUserId type:", typeof excludeUserId);

    // Build where clause
    const whereClause: any = {
      isPromotionOn: true,
      status: "ACTIVE",
      startDate: {
        lte: now, // Start date is less than or equal to now
      },
      endDate: {
        gte: now, // End date is greater than or equal to now
      },
      bannerImage: {
        not: null, // Must have a banner image
      },
    };

    // Exclude promotions from specific user if excludeUserId is provided
    if (excludeUserId) {
      console.log(
        "🎯 BACKEND DEBUG - Adding exclusion for user:",
        excludeUserId
      );
      whereClause.vendor = {
        user: {
          id: { not: excludeUserId as string },
        },
      };
    } else {
      console.log("🎯 BACKEND DEBUG - No exclusion, returning all promotions");
    }

    console.log(
      "🎯 BACKEND DEBUG - Final whereClause:",
      JSON.stringify(whereClause, null, 2)
    );

    // Get active promotions
    const activePromotions = await prisma.promotion.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        serviceListings: {
          include: {
            serviceListing: {
              select: {
                id: true,
                title: true,
                categoryPath: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest promotions first
      },
    });

    console.log(
      "🎯 BACKEND DEBUG - Found promotions:",
      activePromotions.length
    );
    activePromotions.forEach((promo, index) => {
      console.log(
        `🎯 BACKEND DEBUG - Promotion ${index + 1}: ${promo.title} (${
          promo.vendor.user?.email
        })`
      );
    });

    // Transform the response
    const transformedPromotions: PromotionResponse[] = activePromotions.map(
      (promotion) => ({
        id: promotion.id,
        title: promotion.title,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        originalPrice: promotion.originalPrice,
        startDate: promotion.startDate.toISOString(),
        endDate: promotion.endDate.toISOString(),
        bannerImage: promotion.bannerImage,
        status: promotion.status,
        isPromotionOn: promotion.isPromotionOn,
        serviceListings: promotion.serviceListings.map((psl) => ({
          id: psl.serviceListing.id,
          title: psl.serviceListing.title,
          categoryPath: psl.serviceListing.categoryPath,
        })),
        createdAt: promotion.createdAt.toISOString(),
        updatedAt: promotion.updatedAt.toISOString(),
      })
    );

    res.status(200).json({
      success: true,
      data: transformedPromotions,
      message: "Active promotions retrieved successfully",
    });
  } catch (error) {
    logger.error("Error getting active promotions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
  return;
};

// Get promotion details by ID (public - for users)
export const getPromotionDetails = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  try {
    const { id } = req.params;

    // Get the promotion with service listings and full service details
    const promotion = await prisma.promotion.findFirst({
      where: {
        id,
        status: "ACTIVE",
        isPromotionOn: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessPhone: true,
            businessEmail: true,
          },
        },
        serviceListings: {
          include: {
            serviceListing: {
              include: {
                vendor: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                address: true,
                services: {
                  where: {
                    status: "ACTIVE",
                    isServiceOn: true,
                  },
                  orderBy: { price: "asc" },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    discountPrice: true,
                    currency: true,
                    duration: true,
                    status: true,
                    isServiceOn: true,
                    rating: true,
                    totalReviews: true,
                    totalBookings: true,
                    createdAt: true,
                    updatedAt: true,
                    categoryIds: true,
                    categoryPaths: true,
                  },
                },
                promotionListings: {
                  where: {
                    promotion: {
                      status: "ACTIVE",
                      isPromotionOn: true,
                      startDate: { lte: new Date() },
                      endDate: { gte: new Date() },
                    },
                  },
                  include: {
                    promotion: {
                      select: {
                        id: true,
                        title: true,
                        discountType: true,
                        discountValue: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    reviews: {
                      where: {
                        isVerified: true, // Only count verified reviews
                      },
                    },
                    bookings: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found or not active",
      });
    }

    // Calculate verified ratings for each service listing
    const serviceListingsWithVerifiedRatings = await Promise.all(
      promotion.serviceListings.map(async (psl: any) => {
        // Get verified review stats for this service listing
        const verifiedReviewStats = await prisma.review.aggregate({
          where: {
            listingId: psl.serviceListing.id,
            isVerified: true,
          },
          _avg: { rating: true },
          _count: { rating: true },
        });

        return {
          ...psl,
          verifiedRating: verifiedReviewStats._avg.rating || 0,
          verifiedReviewCount: verifiedReviewStats._count.rating || 0,
        };
      })
    );

    // Prepare response with full service details
    const response = {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      originalPrice: promotion.originalPrice,
      startDate: promotion.startDate.toISOString(),
      endDate: promotion.endDate.toISOString(),
      bannerImage: promotion.bannerImage,
      status: promotion.status,
      isPromotionOn: promotion.isPromotionOn,
      vendor: promotion.vendor,
      serviceListings: serviceListingsWithVerifiedRatings.map((psl: any) => {
        // Calculate minimum price from active services (same logic as search)
        const validPrices = psl.serviceListing.services
          .map((s: any) => s.price)
          .filter(
            (price: any) =>
              price !== null && price !== undefined && !isNaN(price)
          );

        const minPrice =
          validPrices.length > 0 ? Math.min(...validPrices) : null;

        // Extract category name using same logic as popular services
        let categoryName = "General";
        if (psl.serviceListing.category?.name) {
          categoryName = psl.serviceListing.category.name;
        } else if (
          psl.serviceListing.categoryPath &&
          psl.serviceListing.categoryPath.length > 0
        ) {
          // Use the root category from categoryPath
          categoryName =
            psl.serviceListing.categoryPath[0]?.name || categoryName;
        } else if (
          psl.serviceListing.services?.[0]?.categoryPaths &&
          psl.serviceListing.services[0].categoryPaths.length > 0
        ) {
          // Use the longest/most specific category path
          const longestPath =
            psl.serviceListing.services[0].categoryPaths.reduce(
              (longest: any, current: any) => {
                return current.length > longest.length ? current : longest;
              },
              []
            );
          // categoryPaths is an array of arrays of strings
          // Use the last item in the longest path (most specific)
          categoryName =
            longestPath.length > 0
              ? longestPath[longestPath.length - 1]
              : categoryName;
        }

        return {
          id: psl.serviceListing.id,
          title: psl.serviceListing.title,
          description: psl.serviceListing.description,
          image: psl.serviceListing.image,
          category: psl.serviceListing.category,
          categoryPath: psl.serviceListing.categoryPath,
          categoryName, // Add extracted category name
          rating: psl.verifiedRating,
          totalReviews: psl.verifiedReviewCount,
          totalBookings: psl.serviceListing._count.bookings,
          address: psl.serviceListing.address,
          vendor: psl.serviceListing.vendor,
          services: psl.serviceListing.services,
          promotionListings: psl.serviceListing.promotionListings,
          // Add calculated discount info for each service
          servicesWithDiscount: psl.serviceListing.services.map(
            (service: any) => {
              const originalPrice = service.price || 0;
              const discountedPrice =
                promotion.discountType === "FIXED"
                  ? Math.max(0, originalPrice - promotion.discountValue)
                  : Math.max(
                      0,
                      originalPrice * (1 - promotion.discountValue / 100)
                    );

              return {
                ...service,
                originalPrice,
                discountedPrice,
                savings: originalPrice - discountedPrice,
                discountText:
                  promotion.discountType === "FIXED"
                    ? `₹${promotion.discountValue} OFF`
                    : `${promotion.discountValue}% OFF`,
              };
            }
          ),
          // Add minPrice for "Start from" display
          minPrice,
        };
      }),
      createdAt: promotion.createdAt.toISOString(),
      updatedAt: promotion.updatedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      data: response,
      message: "Promotion details retrieved successfully",
    });
  } catch (error) {
    logger.error("Error getting promotion details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
  return;
};
