import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new service review
export const createServiceReview = async (req: Request, res: Response) => {
  try {
    console.log("🔍 CREATE REVIEW - Request received");
    console.log("  - Body:", req.body);

    const userId = (req as any).user?.id;
    console.log("  - User ID:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { rating, comment, listingId, serviceId, vendorId } = req.body;
    console.log("  - Rating:", rating);
    console.log("  - Comment length:", comment?.length);
    console.log("  - Listing ID:", listingId);
    console.log("  - Service ID:", serviceId);
    console.log("  - Vendor ID:", vendorId);

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters long",
      });
    }

    if (!listingId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "Listing ID and Vendor ID are required",
      });
    }

    // Check if user already has a review for this listing
    console.log("🔍 CREATE REVIEW - Checking for existing review...");
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        listingId,
      },
    });

    if (existingReview) {
      console.log(
        "❌ CREATE REVIEW - Existing review found:",
        existingReview.id
      );
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this service. You can update your existing review instead.",
      });
    }
    console.log("✅ CREATE REVIEW - No existing review found");

    // Verify the listing exists and get vendor info
    const listing = await prisma.serviceListing.findUnique({
      where: { id: listingId },
      include: { vendor: true },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Service listing not found",
      });
    }

    // Verify vendorId matches
    if (listing.vendorId !== vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID does not match the listing",
      });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        listingId,
        serviceId: serviceId || null,
        vendorId,
        rating,
        comment: comment.trim(),
        isVerified: false, // New reviews start as unverified
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    // Update listing's review statistics
    await updateListingReviewStats(listingId);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating service review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get reviews for a specific service listing
export const getServiceReviews = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const userId = (req as any).user?.id;

    console.log("🔍 GET SERVICE REVIEWS:");
    console.log("  - Listing ID:", listingId);
    console.log("  - User ID:", userId);
    console.log("  - Has userId:", !!userId);

    // Build where clause - default to showing only verified reviews
    const whereClause: any = {
      listingId,
      isVerified: true, // Only show verified reviews by default
    };

    // Check if the user is the vendor for this listing
    // If they are, show all reviews (including unverified)
    if (userId) {
      const listing = await prisma.serviceListing.findUnique({
        where: { id: listingId },
        include: {
          vendor: {
            select: { userId: true },
          },
        },
      });

      console.log("  - Listing found:", !!listing);
      if (listing) {
        console.log("  - Listing vendor userId:", listing.vendor.userId);
        console.log("  - Is vendor?", listing.vendor.userId === userId);
      }

      // If user is the vendor, remove the isVerified filter to show all reviews
      if (listing && listing.vendor.userId === userId) {
        console.log("  - Removing isVerified filter for vendor");
        delete whereClause.isVerified;
      }
    } else {
      console.log("  - No userId, showing only verified reviews");
    }

    console.log("  - Final whereClause:", whereClause);

    if (rating) {
      whereClause.rating = parseInt(rating as string);
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              uploadedImages: {
                where: {
                  type: "PROFILE_PICTURE",
                  isActive: true,
                },
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder,
        },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.review.count({
        where: whereClause,
      }),
    ]);

    // Calculate statistics
    const stats = await prisma.review.aggregate({
      where: whereClause,
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: whereClause,
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
          rating: stats._avg.rating || 0,
          totalReviews: stats._count.rating || 0,
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          }, {} as Record<number, number>),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching service reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's review for a specific service
export const getUserServiceReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { listingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const review = await prisma.review.findFirst({
      where: {
        userId,
        listingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "No review found for this service",
      });
    }

    return res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching user service review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user's service review
export const updateServiceReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { rating, comment } = req.body;

    // Find user's review
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update it",
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Validate comment if provided
    if (comment && comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 10 characters long",
      });
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment: comment.trim() }),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    // Update listing's review statistics
    await updateListingReviewStats(existingReview.listingId);

    return res.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating service review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user's service review
export const deleteServiceReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user's review
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it",
      });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update listing's review statistics
    await updateListingReviewStats(existingReview.listingId);

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Helper function to update listing review statistics
const updateListingReviewStats = async (listingId: string) => {
  try {
    const stats = await prisma.review.aggregate({
      where: {
        listingId,
        isVerified: true, // Only count verified reviews for display
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    console.log("🔍 UPDATE LISTING REVIEW STATS:");
    console.log("  - Listing ID:", listingId);
    console.log("  - Average rating:", stats._avg.rating);
    console.log("  - Total reviews count:", stats._count.rating);

    await prisma.serviceListing.update({
      where: { id: listingId },
      data: {
        rating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0,
      },
    });

    console.log("✅ Total reviews updated to:", stats._count.rating || 0);
  } catch (error) {
    console.error("Error updating listing review stats:", error);
  }
};

// Toggle helpful vote for a review
export const toggleReviewHelpful = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if review is verified
    console.log("🔍 TOGGLE HELPFUL - Review verification check:");
    console.log("  - Review ID:", reviewId);
    console.log("  - Review isVerified:", review.isVerified);
    console.log("  - Review helpful count:", review.helpful);

    if (!review.isVerified) {
      console.log("❌ Review is not verified, rejecting vote");
      return res.status(400).json({
        success: false,
        message: "Cannot vote on unverified reviews",
      });
    }

    console.log("✅ Review is verified, proceeding with vote");

    // Check if user already voted
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: userId,
        },
      },
    });

    let isHelpful: boolean;
    let newHelpfulCount: number;

    if (existingVote) {
      // User already voted - remove the vote
      await prisma.reviewHelpful.delete({
        where: {
          reviewId_userId: {
            reviewId: reviewId,
            userId: userId,
          },
        },
      });

      // Decrease helpful count
      newHelpfulCount = Math.max(0, review.helpful - 1);
      isHelpful = false;
    } else {
      // User hasn't voted - add the vote
      await prisma.reviewHelpful.create({
        data: {
          reviewId: reviewId,
          userId: userId,
        },
      });

      // Increase helpful count
      newHelpfulCount = review.helpful + 1;
      isHelpful = true;
    }

    // Update the review's helpful count
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpful: newHelpfulCount },
    });

    return res.status(200).json({
      success: true,
      data: {
        isHelpful,
        helpfulCount: newHelpfulCount,
      },
      message: isHelpful ? "Marked as helpful" : "Removed helpful vote",
    });
  } catch (error) {
    console.error("Error toggling review helpful:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user has marked a review as helpful
export const checkReviewHelpful = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required",
      });
    }

    // Get the review to access helpful count
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { helpful: true },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user has already voted for this review
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: userId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        isHelpful: !!existingVote,
        helpfulCount: review.helpful,
      },
    });
  } catch (error) {
    console.error("Error checking review helpful:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
