import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

// Interface for user favorites response
interface UserFavoriteResponse {
  id: string;
  userId: string;
  serviceListingId: string;
  createdAt: string;
  updatedAt: string;
  serviceListing: {
    id: string;
    title: string;
    description: string;
    image?: string;
    rating: number;
    totalReviews: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    vendor: {
      id: string;
      businessName: string;
      businessEmail: string;
      businessPhone: string;
      rating: number;
    };
    address: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
}

/**
 * Get user's favorite service listings
 * GET /api/v1/users/:userId/favorites
 */
export const getUserFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Validate required parameters
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    // Convert to numbers
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Verify user exists and get favorites
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get user's favorites with service listing details
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        serviceListing: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                businessEmail: true,
                businessPhone: true,
                rating: true,
              },
            },
            address: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const totalCount = await prisma.userFavorite.count({
      where: { userId },
    });

    // Transform the response
    const transformedFavorites: UserFavoriteResponse[] = favorites.map(
      (favorite) => ({
        id: favorite.id,
        userId: favorite.userId,
        serviceListingId: favorite.serviceListingId,
        createdAt: favorite.createdAt.toISOString(),
        updatedAt: favorite.updatedAt.toISOString(),
        serviceListing: {
          id: favorite.serviceListing.id,
          title: favorite.serviceListing.title,
          description: favorite.serviceListing.description,
          image: favorite.serviceListing.image || undefined,
          rating: favorite.serviceListing.rating,
          totalReviews: favorite.serviceListing.totalReviews,
          category: {
            id: favorite.serviceListing.category.id,
            name: favorite.serviceListing.category.name,
            slug: favorite.serviceListing.category.slug,
          },
          vendor: {
            id: favorite.serviceListing.vendor.id,
            businessName: favorite.serviceListing.vendor.businessName,
            businessEmail: favorite.serviceListing.vendor.businessEmail,
            businessPhone: favorite.serviceListing.vendor.businessPhone,
            rating: favorite.serviceListing.vendor.rating,
          },
          address: {
            id: favorite.serviceListing.address.id,
            name: favorite.serviceListing.address.name,
            address: favorite.serviceListing.address.address,
            city: favorite.serviceListing.address.city,
            state: favorite.serviceListing.address.state,
          },
        },
      })
    );

    res.status(200).json({
      success: true,
      data: transformedFavorites,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
      message: "User favorites retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting user favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Add a service listing to user's favorites
 * POST /api/v1/users/:userId/favorites/:serviceId
 */
export const addToFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { userId, serviceId } = req.params;

    // Validate required parameters
    if (!userId || !serviceId) {
      res.status(400).json({
        success: false,
        message: "User ID and Service ID are required",
      });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Verify service listing exists
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      select: { id: true, title: true, status: true },
    });

    if (!serviceListing) {
      res.status(404).json({
        success: false,
        message: "Service listing not found",
      });
      return;
    }

    // Check if service listing is active
    if (serviceListing.status !== "ACTIVE") {
      res.status(400).json({
        success: false,
        message: "Cannot add inactive service to favorites",
      });
      return;
    }

    // Check if already in favorites
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_serviceListingId: {
          userId,
          serviceListingId: serviceId,
        },
      },
    });

    if (existingFavorite) {
      res.status(409).json({
        success: false,
        message: "Service already in favorites",
      });
      return;
    }

    // Add to favorites
    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        serviceListingId: serviceId,
      },
      include: {
        serviceListing: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
                businessEmail: true,
                businessPhone: true,
                rating: true,
              },
            },
            address: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    // Transform the response
    const transformedFavorite: UserFavoriteResponse = {
      id: favorite.id,
      userId: favorite.userId,
      serviceListingId: favorite.serviceListingId,
      createdAt: favorite.createdAt.toISOString(),
      updatedAt: favorite.updatedAt.toISOString(),
      serviceListing: {
        id: favorite.serviceListing.id,
        title: favorite.serviceListing.title,
        description: favorite.serviceListing.description,
        image: favorite.serviceListing.image || undefined,
        rating: favorite.serviceListing.rating,
        totalReviews: favorite.serviceListing.totalReviews,
        category: {
          id: favorite.serviceListing.category.id,
          name: favorite.serviceListing.category.name,
          slug: favorite.serviceListing.category.slug,
        },
        vendor: {
          id: favorite.serviceListing.vendor.id,
          businessName: favorite.serviceListing.vendor.businessName,
          businessEmail: favorite.serviceListing.vendor.businessEmail,
          businessPhone: favorite.serviceListing.vendor.businessPhone,
          rating: favorite.serviceListing.vendor.rating,
        },
        address: {
          id: favorite.serviceListing.address.id,
          name: favorite.serviceListing.address.name,
          address: favorite.serviceListing.address.address,
          city: favorite.serviceListing.address.city,
          state: favorite.serviceListing.address.state,
        },
      },
    };

    res.status(201).json({
      success: true,
      data: transformedFavorite,
      message: "Service added to favorites successfully",
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Remove a service listing from user's favorites
 * DELETE /api/v1/users/:userId/favorites/:serviceId
 */
export const removeFromFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { userId, serviceId } = req.params;

    // Validate required parameters
    if (!userId || !serviceId) {
      res.status(400).json({
        success: false,
        message: "User ID and Service ID are required",
      });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Find the favorite
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_serviceListingId: {
          userId,
          serviceListingId: serviceId,
        },
      },
      include: {
        serviceListing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!favorite) {
      res.status(404).json({
        success: false,
        message: "Service not found in favorites",
      });
      return;
    }

    // Remove from favorites
    await prisma.userFavorite.delete({
      where: {
        userId_serviceListingId: {
          userId,
          serviceListingId: serviceId,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        serviceListingId: serviceId,
        serviceTitle: favorite.serviceListing.title,
      },
      message: "Service removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Check if a service listing is in user's favorites
 * GET /api/v1/users/:userId/favorites/:serviceId/status
 */
export const checkFavoriteStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { userId, serviceId } = req.params;

    // Validate required parameters
    if (!userId || !serviceId) {
      res.status(400).json({
        success: false,
        message: "User ID and Service ID are required",
      });
      return;
    }

    // Check if service is in favorites
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_serviceListingId: {
          userId,
          serviceListingId: serviceId,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite?.id || null,
        addedAt: favorite?.createdAt?.toISOString() || null,
      },
      message: "Favorite status retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export default {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
};
