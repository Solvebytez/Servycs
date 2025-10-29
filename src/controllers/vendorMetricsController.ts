import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

// Helper to compute period ranges
function getPeriods(window: string) {
  const now = new Date();
  const ms =
    window === "7d" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const currentFrom = new Date(now.getTime() - ms);
  const previousFrom = new Date(now.getTime() - 2 * ms);
  const previousTo = currentFrom;
  return {
    window: window === "7d" ? "7d" : "30d",
    current: { from: currentFrom, to: now },
    previous: { from: previousFrom, to: previousTo },
  };
}

function calcGrowth(current: number, previous: number): number {
  // If there were no items in the previous period, return 0% growth
  if (previous === 0) {
    return 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export const getVendorMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Resolve vendor
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res
        .status(403)
        .json({ success: false, message: "User is not a vendor" });
    }

    const window = (req.query.window as string) || "30d";
    const { current, previous, window: win } = getPeriods(window);

    // Parallel counts
    const [
      listingsTotal,
      listingsCurrent,
      listingsPrevious,
      enquiriesPending,
      enquiriesCurrent,
      enquiriesPrevious,
      reviewsTotal,
      reviewsCurrent,
      reviewsPrevious,
      promotionsTotal,
      promotionsActive,
      promotionsCurrent,
      promotionsPrevious,
    ] = await Promise.all([
      prisma.serviceListing.count({ where: { vendorId: vendor.id } }),
      prisma.serviceListing.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: current.from, lt: current.to },
        },
      }),
      prisma.serviceListing.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: previous.from, lt: previous.to },
        },
      }),
      prisma.enquiry.count({
        where: { vendorId: vendor.id, status: "PENDING" as any },
      }),
      prisma.enquiry.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: current.from, lt: current.to },
        },
      }),
      prisma.enquiry.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: previous.from, lt: previous.to },
        },
      }),
      prisma.review.count({
        where: {
          vendorId: vendor.id,
        },
      }),
      prisma.review.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: current.from, lt: current.to },
        },
      }),
      prisma.review.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: previous.from, lt: previous.to },
        },
      }),
      prisma.promotion.count({ where: { vendorId: vendor.id } }),
      prisma.promotion.count({
        where: { vendorId: vendor.id, status: "ACTIVE" as any },
      }),
      prisma.promotion.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: current.from, lt: current.to },
        },
      }),
      prisma.promotion.count({
        where: {
          vendorId: vendor.id,
          createdAt: { gte: previous.from, lt: previous.to },
        },
      }),
    ]);

    // LOG ALL METRICS VALUES
    console.log("🔍 VENDOR METRICS DEBUG:");
    console.log("Listings:");
    console.log("  - Total:", listingsTotal);
    console.log("  - Current period:", listingsCurrent);
    console.log("  - Previous period:", listingsPrevious);
    console.log("  - Growth %:", calcGrowth(listingsCurrent, listingsPrevious));

    console.log("Promotions:");
    console.log("  - Total:", promotionsTotal);
    console.log("  - Active:", promotionsActive);
    console.log("  - Current period:", promotionsCurrent);
    console.log("  - Previous period:", promotionsPrevious);
    console.log(
      "  - Growth %:",
      calcGrowth(promotionsCurrent, promotionsPrevious)
    );

    console.log("Enquiries:");
    console.log("  - Pending:", enquiriesPending);
    console.log("  - Current period:", enquiriesCurrent);
    console.log("  - Previous period:", enquiriesPrevious);
    console.log(
      "  - Growth %:",
      calcGrowth(enquiriesCurrent, enquiriesPrevious)
    );

    console.log("Reviews:");
    console.log("  - Total:", reviewsTotal);
    console.log("  - Current period:", reviewsCurrent);
    console.log("  - Previous period:", reviewsPrevious);
    console.log("  - Growth %:", calcGrowth(reviewsCurrent, reviewsPrevious));

    console.log("Period ranges:");
    console.log("  - Current from:", current.from.toISOString());
    console.log("  - Current to:", current.to.toISOString());
    console.log("  - Previous from:", previous.from.toISOString());
    console.log("  - Previous to:", previous.to.toISOString());

    return res.json({
      success: true,
      data: {
        window: win,
        period: {
          current: {
            from: current.from.toISOString(),
            to: current.to.toISOString(),
          },
          previous: {
            from: previous.from.toISOString(),
            to: previous.to.toISOString(),
          },
        },
        cards: {
          listings: {
            value: listingsTotal,
            current: listingsCurrent,
            previous: listingsPrevious,
            growthPercent: calcGrowth(listingsCurrent, listingsPrevious),
          },
          enquiries: {
            value: enquiriesPending,
            current: enquiriesCurrent,
            previous: enquiriesPrevious,
            growthPercent: calcGrowth(enquiriesCurrent, enquiriesPrevious),
          },
          reviews: {
            value: reviewsTotal,
            current: reviewsCurrent,
            previous: reviewsPrevious,
            growthPercent: calcGrowth(reviewsCurrent, reviewsPrevious),
          },
          promotions: {
            value: promotionsTotal,
            activeCount: promotionsActive,
            current: promotionsCurrent,
            previous: promotionsPrevious,
            growthPercent: calcGrowth(promotionsCurrent, promotionsPrevious),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching vendor metrics:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
