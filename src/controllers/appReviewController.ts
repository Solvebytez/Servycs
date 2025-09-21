import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new app review
export const createAppReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      rating,
      title,
      comment,
      categories,
      ratings,
      isAnonymous,
      deviceInfo,
    } = req.body;

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user already has a review
    const existingReview = await prisma.appReview.findFirst({
      where: { userId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted a review. You can update your existing review instead.",
      });
    }

    // Create the review
    const review = await prisma.appReview.create({
      data: {
        userId,
        rating,
        title,
        comment,
        categories: categories || [],
        ratings,
        isAnonymous: isAnonymous || false,
        deviceInfo,
        status: "PENDING", // New reviews start as pending
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "App review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating app review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all app reviews (public)
export const getAppReviews = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      status,
      isPublic,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build where clause
    const whereClause: any = {};

    if (rating) {
      whereClause.rating = parseInt(rating as string);
    }

    if (status) {
      whereClause.status = status;
    }

    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === "true";
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.appReview.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder,
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.appReview.count({
        where: whereClause,
      }),
    ]);

    // Calculate statistics
    const stats = await prisma.appReview.aggregate({
      where: { ...whereClause, status: "APPROVED" },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Rating distribution
    const ratingDistribution = await prisma.appReview.groupBy({
      by: ["rating"],
      where: { ...whereClause, status: "APPROVED" },
      _count: {
        rating: true,
      },
    });

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: totalCount,
      pages: Math.ceil(totalCount / parseInt(limit as string)),
      hasNext:
        parseInt(page as string) <
        Math.ceil(totalCount / parseInt(limit as string)),
      hasPrev: parseInt(page as string) > 1,
    };

    return res.json({
      success: true,
      data: {
        reviews,
        pagination,
        statistics: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.rating || 0,
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          }, {} as Record<number, number>),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching app reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's own review
export const getUserAppReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const review = await prisma.appReview.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "No review found for this user",
      });
    }

    return res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching user app review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user's own review
export const updateAppReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      rating,
      title,
      comment,
      categories,
      ratings,
      isAnonymous,
      deviceInfo,
    } = req.body;

    // Find user's review
    const existingReview = await prisma.appReview.findFirst({
      where: { userId },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "No review found to update",
      });
    }

    // Update the review
    const updatedReview = await prisma.appReview.update({
      where: { id: existingReview.id },
      data: {
        ...(rating && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        ...(categories !== undefined && { categories }),
        ...(ratings !== undefined && { ratings }),
        ...(isAnonymous !== undefined && { isAnonymous }),
        ...(deviceInfo !== undefined && { deviceInfo }),
        status: "PENDING", // Reset to pending when updated
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "App review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating app review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user's own review
export const deleteAppReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user's review
    const existingReview = await prisma.appReview.findFirst({
      where: { userId },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "No review found to delete",
      });
    }

    // Delete the review
    await prisma.appReview.delete({
      where: { id: existingReview.id },
    });

    return res.json({
      success: true,
      message: "App review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting app review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark review as helpful/not helpful
export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isHelpful must be a boolean value",
      });
    }

    // Find the review
    const review = await prisma.appReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update helpful/not helpful count
    const updatedReview = await prisma.appReview.update({
      where: { id: reviewId },
      data: {
        helpful: isHelpful ? review.helpful + 1 : review.helpful,
        notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful,
      },
    });

    return res.json({
      success: true,
      message: `Review marked as ${isHelpful ? "helpful" : "not helpful"}`,
      data: {
        helpful: updatedReview.helpful,
        notHelpful: updatedReview.notHelpful,
      },
    });
  } catch (error) {
    console.error("Error marking review helpful:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin: Get all reviews with moderation
export const getAppReviewsForModeration = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build where clause
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.appReview.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder,
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.appReview.count({
        where: whereClause,
      }),
    ]);

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: totalCount,
      pages: Math.ceil(totalCount / parseInt(limit as string)),
      hasNext:
        parseInt(page as string) <
        Math.ceil(totalCount / parseInt(limit as string)),
      hasPrev: parseInt(page as string) > 1,
    };

    return res.json({
      success: true,
      data: {
        reviews,
        pagination,
      },
    });
  } catch (error) {
    console.error("Error fetching app reviews for moderation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin: Update review status
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED", "HIDDEN"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be PENDING, APPROVED, REJECTED, or HIDDEN",
      });
    }

    // Find the review
    const review = await prisma.appReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update the status
    const updatedReview = await prisma.appReview.update({
      where: { id: reviewId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: `Review status updated to ${status}`,
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
