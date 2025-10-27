import { Request, Response } from "express";
import { prisma } from "@/config/database";
import { CustomError } from "@/middleware/errorHandler";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get vendors created by a specific salesman
export const getSalesmanVendors = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { salesmanId } = req.params;
    const { status, page = "1", limit = "10" } = req.query;

    // Validate salesman ID
    if (!salesmanId) {
      throw new CustomError("Salesman ID is required", 400);
    }

    // Check if the authenticated user is the salesman or an admin
    if (req.user?.id !== salesmanId && req.user?.role !== "ADMIN") {
      throw new CustomError("Unauthorized access to salesman data", 403);
    }

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {
      createdBy: salesmanId,
      role: "VENDOR",
    };

    // Add status filter if provided
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Get vendors with pagination
    const [vendors, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          vendor: {
            include: {
              businessAddresses: true,
              serviceListings: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  rating: true,
                  totalReviews: true,
                  totalBookings: true,
                },
              },
            },
          },
          uploadedImages: {
            where: {
              type: "PROFILE_PICTURE",
              isActive: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNum,
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    // Transform the data
    const transformedVendors = vendors.map((user) => {
      const vendor = user.vendor;
      const profilePicture = user.uploadedImages[0];

      // Calculate overall rating and stats from service listings
      const serviceListings = vendor?.serviceListings || [];
      const totalReviews = serviceListings.reduce(
        (sum, listing) => sum + listing.totalReviews,
        0
      );
      const totalBookings = serviceListings.reduce(
        (sum, listing) => sum + listing.totalBookings,
        0
      );
      const averageRating =
        serviceListings.length > 0
          ? serviceListings.reduce((sum, listing) => sum + listing.rating, 0) /
            serviceListings.length
          : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: vendor?.businessName,
        businessEmail: vendor?.businessEmail,
        businessPhone: vendor?.businessPhone,
        status: user.status,
        isVerified: user.isEmailVerified,
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
        serviceListingsCount: serviceListings.length,
        createdAt: user.createdAt,
        profilePicture: profilePicture?.url,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Calculate status counts for all vendors (not just current page)
    const statusCounts = await prisma.user.groupBy({
      by: ["status"],
      where: {
        createdBy: salesmanId,
        role: "VENDOR",
      },
      _count: {
        status: true,
      },
    });

    const counts = {
      all: totalCount,
      ACTIVE: 0,
      PENDING: 0,
      INACTIVE: 0,
      SUSPENDED: 0,
    };

    statusCounts.forEach((item) => {
      if (item.status === "ACTIVE") counts.ACTIVE = item._count.status;
      else if (item.status === "PENDING") counts.PENDING = item._count.status;
      else if (item.status === "INACTIVE") counts.INACTIVE = item._count.status;
      else if (item.status === "SUSPENDED")
        counts.SUSPENDED = item._count.status;
    });

    res.json({
      success: true,
      data: transformedVendors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNext,
        hasPrev,
      },
      statusCounts: counts,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error("Error fetching salesman vendors:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

// Get salesman metrics for dashboard
export const getSalesmanMetrics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get salesman record
    const salesman = await prisma.salesman.findUnique({
      where: { userId },
    });

    if (!salesman) {
      res.status(404).json({
        success: false,
        message: "Salesman profile not found",
      });
      return;
    }

    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Calculate all required metrics in parallel
    const [
      totalVendors,
      totalUsers,
      newVendorsThisWeek,
      newUsersThisWeek,
      recentVendors,
      recentUsers,
    ] = await Promise.all([
      // Total counts
      prisma.user.count({
        where: {
          createdBy: userId,
          role: "VENDOR",
        },
      }),
      prisma.user.count({
        where: {
          createdBy: userId,
          role: "USER",
        },
      }),

      // This week's counts
      prisma.user.count({
        where: {
          createdBy: userId,
          role: "VENDOR",
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.user.count({
        where: {
          createdBy: userId,
          role: "USER",
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Recent activity (last 5 vendors)
      prisma.user.findMany({
        where: {
          createdBy: userId,
          role: "VENDOR",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          createdAt: true,
          primaryCity: true,
          name: true,
        },
      }),

      // Recent activity (last 5 users)
      prisma.user.findMany({
        where: {
          createdBy: userId,
          role: "USER",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          createdAt: true,
          primaryCity: true,
          name: true,
        },
      }),
    ]);

    // Helper function to format time ago
    const formatTimeAgo = (date: Date): string => {
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
    };

    // Format recent activity
    const recentActivity = [
      ...recentVendors.map((v) => ({
        type: "vendor" as const,
        count: 1,
        location: v.primaryCity || "Unknown",
        timeAgo: formatTimeAgo(v.createdAt),
        name: v.name,
      })),
      ...recentUsers.map((u) => ({
        type: "user" as const,
        count: 1,
        location: u.primaryCity || "Unknown",
        timeAgo: formatTimeAgo(u.createdAt),
        name: u.name,
      })),
    ]
      .sort(
        (a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime()
      )
      .slice(0, 5);

    // Return complete dashboard data
    res.json({
      success: true,
      data: {
        vendorsOnboarded: totalVendors,
        usersOnboarded: totalUsers,
        totalCommission: salesman.totalCommission,
        newVendorsThisWeek,
        newUsersThisWeek,
        recentActivity,
        territory: salesman.territory,
      },
    });
  } catch (error) {
    console.error("Error fetching salesman metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
