import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import {
  deleteFromCloudinary,
  extractPublicId,
  deleteLocalFile,
} from "@/utils/upload";
import {
  buildCategoryFilter,
  buildCategoryPathsFromIds,
} from "@/utils/categoryUtils";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

/**
 * Business Hours Helper Functions
 */
// Check if a service is currently open based on business hours
const isServiceOpenNow = (
  businessHours: BusinessHours,
  timezone?: string
): boolean => {
  // Use provided timezone or default to server timezone
  const now = timezone
    ? new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))
    : new Date();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = dayNames[now.getDay()] as keyof BusinessHours;
  const currentTime = now.toTimeString().substring(0, 5); // Get time in HH:MM format

  console.log(
    `    🕐 Current time in ${
      timezone || "server timezone"
    }: ${currentTime} (${currentDay})`
  );

  const dayHours = businessHours[currentDay];
  if (!dayHours || !dayHours.isOpen) {
    console.log(`    ❌ Service is closed on ${currentDay}`);
    return false;
  }

  const isOpen =
    currentTime >= dayHours.openTime && currentTime <= dayHours.closeTime;
  console.log(
    `    🕐 Service hours: ${dayHours.openTime} - ${dayHours.closeTime}`
  );
  console.log(`    🕐 Current time: ${currentTime}`);
  console.log(`    🕐 Is open: ${isOpen}`);

  return isOpen;
};

// Check if a service is 24/7 (open all days with extended hours)
const isService24_7 = (businessHours: BusinessHours): boolean => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return days.every((day) => {
    const dayHours = businessHours[day];
    return (
      dayHours &&
      dayHours.isOpen &&
      dayHours.openTime === "00:00" &&
      dayHours.closeTime === "23:59"
    );
  });
};

// Check if a service is open on weekdays (Monday to Friday)
const isServiceOpenWeekdays = (businessHours: BusinessHours): boolean => {
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  return weekdays.every((day) => {
    const dayHours = businessHours[day];
    return dayHours && dayHours.isOpen;
  });
};

// Check if a service is open on weekends (Saturday and Sunday)
const isServiceOpenWeekends = (businessHours: BusinessHours): boolean => {
  const weekends = ["saturday", "sunday"];

  return weekends.every((day) => {
    const dayHours = businessHours[day];
    return dayHours && dayHours.isOpen;
  });
};

/**
 * Validation function to ensure service listing and sub-services status consistency
 * Business Rule: If a main service listing is ACTIVE, all its related sub-services must also be ACTIVE
 * This prevents data inconsistency where main services are active but sub-services are pending
 */
const ensureServiceStatusConsistency = async (
  serviceListingId: string,
  status: string
) => {
  if (status === "ACTIVE") {
    // If main service is ACTIVE, ensure all sub-services are also ACTIVE
    const updatedCount = await prisma.service.updateMany({
      where: {
        listingId: serviceListingId,
        status: "PENDING",
      },
      data: {
        status: "ACTIVE",
      },
    });

    if (updatedCount.count > 0) {
      console.log(
        `✅ Auto-updated ${updatedCount.count} sub-services to ACTIVE for service listing ${serviceListingId}`
      );
    }
  }
};

// Interface for business hours
interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

// Interface for creating a service listing
interface CreateServiceListingRequest {
  title: string;
  description: string;
  categoryId: string;
  categoryPath: string[];
  contactNumber: string;
  whatsappNumber: string;
  image?: string;
  selectedAddressId: string;
  businessHours?: BusinessHours;
  status?: "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "OFF_SERVICE";
  services: {
    name: string;
    description: string;
    price?: number;
    discountPrice?: number;
    duration?: string;
    categoryIds?: string[];
    categoryPaths?: any;
  }[];
}

// Interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  status?: "DRAFT" | "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE";
}

// Interface for paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
  meta: {
    requestTime: number;
    cacheHit: boolean;
  };
}

// Create a new service listing
export const createServiceListing = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("=== CREATE SERVICE LISTING START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request body keys:", Object.keys(req.body || {}));
  console.log("User ID:", req.user?.id);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      console.log("❌ User not authenticated");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      title,
      description,
      categoryId,
      categoryPath,
      contactNumber,
      whatsappNumber,
      image,
      selectedAddressId,
      businessHours,
      status = "DRAFT", // Default to DRAFT for new listings
      services,
    }: CreateServiceListingRequest = req.body;

    console.log("=== SERVICE LISTING DATA ===");
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Category ID:", categoryId);
    console.log("Category Path:", categoryPath);
    console.log("Contact Number:", contactNumber);
    console.log("WhatsApp Number:", whatsappNumber);
    console.log("Image URL:", image);
    console.log("Selected Address ID:", selectedAddressId);
    console.log("Business Hours:", businessHours);
    console.log("Current Step:", req.body.currentStep);
    console.log("Status:", status);
    console.log("Services Count:", services ? services.length : 0);
    console.log("Services Data:", JSON.stringify(services, null, 2));
    console.log("=============================");

    // Verify user is a vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "Only vendors can create service listings",
      });
    }

    // Verify the category exists (only if categoryId is provided)
    let category = null;
    if (categoryId) {
      category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "The selected category does not exist or has been deleted. Please select a valid category.",
          error: "INVALID_CATEGORY_ID",
        });
      }
    }

    // Verify the address belongs to the vendor (only if selectedAddressId is provided)
    let address = null;
    if (selectedAddressId) {
      address = await prisma.businessAddress.findFirst({
        where: {
          id: selectedAddressId,
          vendorId: vendor.id,
        },
      });

      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Invalid address or address does not belong to vendor",
        });
      }
    }

    // Get current step from request body
    const currentStep = req.body.currentStep || 1;

    // Validate services array (only for step 3+ or PENDING status)
    console.log("=== SERVICE VALIDATION ===");
    console.log("Current Step:", currentStep);
    console.log("Status:", status);
    console.log("Services Array:", services);
    console.log("Services Length:", services ? services.length : 0);
    console.log(
      "Validation Condition:",
      currentStep >= 3 || status === "PENDING"
    );
    console.log(
      "Services Required:",
      (currentStep >= 3 || status === "PENDING") &&
        (!services || services.length === 0)
    );

    if (
      (currentStep >= 3 || status === "PENDING") &&
      (!services || services.length === 0)
    ) {
      console.log("❌ VALIDATION FAILED: At least one service is required");
      return res.status(400).json({
        success: false,
        message: "At least one service is required",
      });
    }
    console.log("✅ Service validation passed");
    console.log("=========================");

    // Validate each service (only for step 3+ or PENDING status)
    if (currentStep >= 3 || status === "PENDING") {
      for (const service of services) {
        if (!service.name?.trim() || !service.description?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Each service must have a valid name and description",
          });
        }

        // Validate price if provided
        if (service.price !== undefined && service.price !== null) {
          if (typeof service.price !== "number" || service.price <= 0) {
            return res.status(400).json({
              success: false,
              message:
                "Service price must be a valid number greater than 0 if provided",
            });
          }
        }

        // Validate duration if provided
        if (service.duration !== undefined && service.duration !== null) {
          if (
            typeof service.duration !== "string" ||
            !service.duration.trim()
          ) {
            return res.status(400).json({
              success: false,
              message: "Service duration must be a valid string if provided",
            });
          }
        }
        if (service.discountPrice !== undefined && service.discountPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Discount price must be 0 or greater",
          });
        }
        if (
          service.discountPrice !== undefined &&
          service.price !== undefined &&
          service.discountPrice >= service.price
        ) {
          return res.status(400).json({
            success: false,
            message: "Discount price must be less than the base price",
          });
        }
      }
    }

    // Create the service listing with services in a transaction
    console.log("Creating service listing in transaction...");
    const result = await prisma.$transaction(async (tx) => {
      // Create the service listing
      console.log("Creating service listing with data:", {
        vendorId: vendor.id,
        title: title.trim(),
        description: description.trim(),
        categoryId,
        categoryPath,
        contactNumber: contactNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        image: image || null,
        addressId: selectedAddressId,
      });

      const serviceListingData: any = {
        vendorId: vendor.id,
        title: title.trim(),
        description: description.trim(),
        categoryPath: categoryPath || [],
        contactNumber: contactNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        status: status,
      };

      // Only include optional fields if they have values
      if (categoryId) {
        serviceListingData.categoryId = categoryId;
      }
      if (image) {
        let finalImageUrl = image;

        // Check if the image is a local URI that needs to be uploaded to Cloudinary
        if (
          image &&
          (image.startsWith("file://") || image.startsWith("content://"))
        ) {
          console.log(
            "📤 Local image URI detected in create, uploading to Cloudinary:",
            image
          );

          try {
            // For local URIs, we need to read the file and upload it
            const fs = await import("fs");
            const path = await import("path");

            // Extract file path from URI
            const filePath = image
              .replace("file://", "")
              .replace("content://", "");

            if (fs.existsSync(filePath)) {
              const fileBuffer = fs.readFileSync(filePath);
              const filename = path.basename(filePath);

              // Upload buffer to Cloudinary
              const { uploadBufferToCloudinary } = await import(
                "@/utils/upload"
              );
              finalImageUrl = await uploadBufferToCloudinary(
                fileBuffer,
                "listro/service-images",
                filename
              );
              console.log("✅ Image uploaded to Cloudinary:", finalImageUrl);

              // Clean up local file after successful upload
              deleteLocalFile(filePath);
            } else {
              console.log("❌ Local file not found:", filePath);
              throw new Error("Local image file not found");
            }
          } catch (uploadError) {
            console.error(
              "❌ Failed to upload local image to Cloudinary:",
              uploadError
            );
            throw new Error("Failed to upload image to Cloudinary");
          }
        }

        serviceListingData.image = finalImageUrl;
      }
      if (selectedAddressId) {
        serviceListingData.addressId = selectedAddressId;
      }

      const serviceListing = await tx.serviceListing.create({
        data: serviceListingData,
      });

      console.log("✅ Service listing created:", serviceListing.id);

      // Helper function to convert duration to minutes
      const convertDurationToMinutes = (duration: string): number | null => {
        if (!duration?.trim()) return null;
        const timeParts = duration.trim().split(":");
        if (timeParts.length === 2) {
          const hours = parseInt(timeParts[0] || "0") || 0;
          const minutes = parseInt(timeParts[1] || "0") || 0;
          return hours * 60 + minutes;
        }
        return null;
      };

      // Create the individual services (only if services exist and have valid names)
      let createdServices: any[] = [];
      console.log("=== SERVICE CREATION START ===");
      console.log("Original services count:", services ? services.length : 0);
      console.log("Original services:", JSON.stringify(services, null, 2));

      if (services && services.length > 0) {
        // Filter out services with empty names
        const validServices = services.filter(
          (service) => service.name && service.name.trim().length > 0
        );

        console.log("Valid services after name filter:", validServices.length);
        console.log(
          "Valid services data:",
          JSON.stringify(validServices, null, 2)
        );

        if (validServices.length > 0) {
          // Validate categories for all services before creating
          console.log("=== CATEGORY VALIDATION ===");
          for (const service of validServices) {
            console.log(`Validating service: ${service.name}`);
            console.log(`Service categoryIds:`, service.categoryIds);
            console.log(`Service categoryPaths:`, service.categoryPaths);

            if (service.categoryIds && service.categoryIds.length > 0) {
              console.log(`Checking categories for service: ${service.name}`);
              const existingCategories = await tx.category.findMany({
                where: {
                  id: { in: service.categoryIds },
                  isActive: true,
                },
                select: { id: true },
              });

              console.log(
                `Found ${existingCategories.length} existing categories out of ${service.categoryIds.length} requested`
              );
              console.log(
                `Existing category IDs:`,
                existingCategories.map((c) => c.id)
              );

              if (existingCategories.length !== service.categoryIds.length) {
                console.log(
                  "❌ CATEGORY VALIDATION FAILED: One or more category IDs do not exist or are inactive"
                );
                throw new Error(
                  "One or more category IDs do not exist or are inactive"
                );
              }
              console.log(
                `✅ Category validation passed for service: ${service.name}`
              );
            } else {
              console.log(
                `⚠️ Service ${service.name} has no categories (this is allowed for DRAFT status)`
              );
            }
          }
          console.log("=== CATEGORY VALIDATION COMPLETE ===");

          console.log("=== CREATING SERVICES IN DATABASE ===");
          createdServices = await Promise.all(
            validServices.map(async (service, index) => {
              // Automatically build category paths from category IDs
              let categoryPaths = service.categoryPaths || [];
              if (service.categoryIds && service.categoryIds.length > 0) {
                console.log(
                  `🔧 Building category paths for service: ${service.name}`
                );
                console.log(`Category IDs:`, service.categoryIds);

                try {
                  const builtPaths = await buildCategoryPathsFromIds(
                    service.categoryIds
                  );
                  categoryPaths = builtPaths;
                  console.log(`✅ Built category paths:`, builtPaths);
                } catch (error) {
                  console.error(
                    `❌ Failed to build category paths for service ${service.name}:`,
                    error
                  );
                  // Fall back to provided paths or empty array
                  categoryPaths = service.categoryPaths || [];
                }
              }

              const serviceData = {
                listingId: serviceListing.id,
                name: service.name.trim(),
                description: service.description.trim(),
                price: service.price !== undefined ? service.price : null,
                discountPrice: service.discountPrice || null,
                duration: service.duration
                  ? convertDurationToMinutes(service.duration)
                  : null,
                status: status, // Use the same status as the listing
                categoryIds: service.categoryIds || [], // Use provided category IDs
                categoryPaths: categoryPaths, // Use automatically built or provided category paths
                categoryId:
                  service.categoryIds && service.categoryIds.length > 0
                    ? service.categoryIds[0]
                    : null, // Set first category as primary for backward compatibility
              };

              console.log(`Creating service ${index + 1}:`, service.name);
              console.log(
                `Service data:`,
                JSON.stringify(serviceData, null, 2)
              );

              const createdService = await tx.service.create({
                data: serviceData,
              });

              console.log(`✅ Service created with ID: ${createdService.id}`);
              return createdService;
            })
          );
          console.log(
            `=== ALL SERVICES CREATED: ${createdServices.length} services ===`
          );
        } else {
          console.log(
            "⚠️ No valid services to create (all services filtered out)"
          );
        }
      } else {
        console.log("⚠️ No services provided in request");
      }
      console.log("=== SERVICE CREATION COMPLETE ===");

      return { serviceListing, services: createdServices };
    });

    // Ensure service status consistency (if main service is ACTIVE, sub-services should be ACTIVE too)
    await ensureServiceStatusConsistency(
      result.serviceListing.id,
      result.serviceListing.status
    );

    // Fetch the complete listing with relations
    const completeListing = await prisma.serviceListing.findUnique({
      where: { id: result.serviceListing.id },
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
        services: true,
      },
    });

    console.log("=== CREATE SERVICE LISTING SUCCESS ===");
    console.log("Complete listing:", JSON.stringify(completeListing, null, 2));
    console.log(
      "Services in final listing:",
      completeListing?.services?.length || 0
    );
    if (completeListing?.services) {
      completeListing.services.forEach((service, index) => {
        console.log(`Final Service ${index + 1}:`, {
          id: service.id,
          name: service.name,
          categoryIds: service.categoryIds,
          categoryPaths: service.categoryPaths,
          price: service.price,
        });
      });
    }

    return res.status(201).json({
      success: true,
      message: "Service listing created successfully",
      data: completeListing,
    });
  } catch (error) {
    console.error("=== CREATE SERVICE LISTING ERROR ===");
    console.error("Error details:", error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get all service listings (with pagination and filters)
export const getServiceListings = async (req: Request, res: Response) => {
  try {
    console.log("🚀 getServiceListings called with query params:", req.query);

    const {
      page = "1",
      limit = "10",
      categoryId,
      vendorId,
      search,
      minPrice,
      maxPrice,
      city,
      state,
      isActive = "true",
      excludeUserId,
      sortBy = "createdAt",
      sortOrder = "desc",
      // New filter parameters
      minRating,
      maxRating,
      businessHours,
      timezone,
      features,
      subcategoryIds,
    } = req.query;

    console.log("📋 Parsed parameters:");
    console.log("  - sortBy:", sortBy);
    console.log("  - sortOrder:", sortOrder);
    console.log("  - minPrice:", minPrice);
    console.log("  - maxPrice:", maxPrice);
    console.log("  - minRating:", minRating);
    console.log("  - maxRating:", maxRating);
    console.log("  - businessHours:", businessHours);
    console.log("  - timezone:", timezone);
    console.log("  - excludeUserId:", excludeUserId);
    console.log("  - categoryId:", categoryId);
    console.log("  - subcategoryIds:", subcategoryIds);

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Handle status filtering - by default show only ACTIVE and ON listings
    // Build OR conditions array to combine multiple OR clauses
    const orConditions: any[] = [];

    if (isActive === "true" || isActive === undefined) {
      where.status = "ACTIVE";
      where.isServiceOn = true; // Only show services that are turned on by vendor
      // Only show listings that have at least one active service
      where.services = {
        some: {
          status: "ACTIVE",
          isServiceOn: true,
        },
      };
    } else if (isActive === "false") {
      orConditions.push({ status: { not: "ACTIVE" } });
      orConditions.push({ isServiceOn: false });
    }

    // Handle category filtering - ALWAYS apply as main filter (not OR condition)
    if (categoryId) {
      // Parse subcategoryIds if provided
      const subcategoryArray = subcategoryIds
        ? Array.isArray(subcategoryIds)
          ? subcategoryIds
          : [subcategoryIds]
        : undefined;

      // Build category filter using deep filtering logic
      const categoryFilter = await buildCategoryFilter(
        categoryId as string,
        subcategoryArray as string[]
      );

      console.log("🔍 Backend category filter result:", categoryFilter);

      // Apply category filter to main where clause (not orConditions)
      if (Object.keys(categoryFilter).length > 0) {
        // Merge category filter into main where clause
        Object.assign(where, categoryFilter);
        console.log("✅ Category filter applied to main where clause");
      }
    }

    // Handle user exclusion - apply after category filter
    if (excludeUserId) {
      where.vendor = {
        user: {
          id: { not: excludeUserId as string },
        },
      };
    }

    // Apply OR conditions if any exist
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    if (vendorId) {
      where.vendorId = vendorId as string;
    }

    if (search) {
      // Add search conditions to OR array
      orConditions.push({
        title: { contains: search as string, mode: "insensitive" },
      });
      orConditions.push({
        description: { contains: search as string, mode: "insensitive" },
      });
    }

    if (city) {
      where.address = {
        city: { contains: city as string, mode: "insensitive" },
      };
    }

    if (state) {
      where.address = {
        ...where.address,
        state: { contains: state as string, mode: "insensitive" },
      };
    }

    // Exclude services from a specific user (useful for popular services to exclude current user's vendor services)
    // Note: User exclusion is now handled within category filtering conditions above
    if (excludeUserId && !categoryId) {
      where.vendor = {
        user: {
          id: { not: excludeUserId as string },
        },
      };
    }

    // Handle rating filter
    if (minRating) {
      const ratingValue = parseFloat(minRating as string);
      where.rating = {
        gte: ratingValue,
      };
    }

    // Handle max rating filter (for "Below 3 Stars")
    if (maxRating) {
      const ratingValue = parseFloat(maxRating as string);
      where.rating = {
        ...where.rating,
        lt: ratingValue,
      };
    }

    // Handle business hours filter
    if (businessHours) {
      const hoursValue = businessHours as string;
      console.log(`🏢 Setting up business hours query filter: ${hoursValue}`);

      // For business hours filtering, we only need to ensure we get active services
      // The actual business hours logic will be handled in post-query filtering
      where.isServiceOn = true;
      where.status = "ACTIVE";
      where.services = {
        some: {
          status: "ACTIVE",
          isServiceOn: true,
        },
      };

      console.log(
        `📋 Query filter applied: isServiceOn=true, status=ACTIVE, active services only`
      );
    }

    // Handle features filter (multiple selection)
    if (features) {
      const featuresArray = Array.isArray(features) ? features : [features];
      // This would require a features field in your database
      // For now, we'll skip this as it depends on your features implementation
      console.log("Features filter requested:", featuresArray);
    }

    // For price sorting, we need to fetch all results first, then sort globally, then paginate
    let listings, total;

    if (sortBy === "price") {
      // Get ALL listings first for global price sorting
      const allListings = await prisma.serviceListing.findMany({
        where,
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
              bookings: true,
              reviews: true,
            },
          },
        },
      });

      // Sort globally by price
      allListings.sort((a: any, b: any) => {
        const aMinPrice =
          a.services && a.services.length > 0
            ? Math.min(...a.services.map((s: any) => s.price))
            : Infinity;
        const bMinPrice =
          b.services && b.services.length > 0
            ? Math.min(...b.services.map((s: any) => s.price))
            : Infinity;

        return sortOrder === "asc"
          ? aMinPrice - bMinPrice
          : bMinPrice - aMinPrice;
      });

      // Apply pagination after global sorting
      total = allListings.length;
      listings = allListings.slice(skip, skip + limitNum);
    } else {
      // For non-price sorting, use the original approach
      [listings, total] = await Promise.all([
        prisma.serviceListing.findMany({
          where,
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
                bookings: true,
                reviews: true,
              },
            },
          },
          orderBy: { [sortBy as string]: sortOrder as "asc" | "desc" },
          skip,
          take: limitNum,
        }),
        prisma.serviceListing.count({ where }),
      ]);
    }

    // console.log("📊 Prisma query results:");
    console.log("  - Total listings found:", listings.length);
    console.log("  - Total count:", total);
    console.log("  - First 3 listings:");
    listings.slice(0, 3).forEach((listing: any, index: number) => {
      console.log(`    ${index + 1}. ${listing.title}`);
      console.log(
        `       - Services count: ${
          listing.services ? listing.services.length : 0
        }`
      );
      if (listing.services && listing.services.length > 0) {
        listing.services.forEach((service: any, serviceIndex: number) => {
          console.log(
            `       - Service ${serviceIndex + 1}: ${service.name} - ${
              service.price
            } (status: ${service.status}, isServiceOn: ${service.isServiceOn})`
          );
        });
        const minPrice = Math.min(...listing.services.map((s: any) => s.price));
        console.log(`       - Min Price: ${minPrice}`);
      } else {
        console.log(`       - No services found`);
      }
    });

    // Filter by price range if specified
    let filteredListings = listings;
    console.log("🔍 Checking price filter condition:");
    console.log("  - minPrice:", minPrice, "type:", typeof minPrice);
    console.log("  - maxPrice:", maxPrice, "type:", typeof maxPrice);
    console.log("  - minPrice truthy:", !!minPrice);
    console.log("  - maxPrice truthy:", !!maxPrice);
    console.log("  - Condition result:", !!(minPrice || maxPrice));

    if (minPrice || maxPrice) {
      console.log("💰 Price filtering applied:");
      console.log("  - minPrice:", minPrice);
      console.log("  - maxPrice:", maxPrice);
      console.log("  - Total listings before price filter:", listings.length);

      filteredListings = listings.filter((listing: any) => {
        if (!listing.services || listing.services.length === 0) return false;

        const minServicePrice = Math.min(
          ...listing.services.map((s: any) => s.price)
        );
        const maxServicePrice = Math.max(
          ...listing.services.map((s: any) => s.price)
        );

        console.log(
          `  - ${listing.title}: minPrice=${minServicePrice}, maxPrice=${maxServicePrice}`
        );

        // Check if service's minimum price falls within the filter range
        if (minPrice && minServicePrice < parseFloat(minPrice as string)) {
          console.log(
            `    ❌ Filtered out: minServicePrice (${minServicePrice}) < minPrice (${minPrice})`
          );
          return false;
        }
        if (maxPrice && minServicePrice > parseFloat(maxPrice as string)) {
          console.log(
            `    ❌ Filtered out: minServicePrice (${minServicePrice}) > maxPrice (${maxPrice})`
          );
          return false;
        }

        console.log(
          `    ✅ Included: minServicePrice (${minServicePrice}) falls within filter range`
        );
        return true;
      });

      console.log(
        "  - Total listings after price filter:",
        filteredListings.length
      );
    }

    // Price sorting is now handled globally before pagination
    // No need for post-query sorting for price

    // Filter by business hours if specified
    if (businessHours) {
      const hoursValue = businessHours as string;
      console.log(`🔍 Filtering by business hours: ${hoursValue}`);
      console.log(`📊 Initial listings count: ${filteredListings.length}`);

      filteredListings = filteredListings.filter((listing: any) => {
        console.log(`🔍 Checking listing: ${listing.title}`);
        // Check if any service in the listing matches the business hours criteria
        // Check business hours at ServiceListing level (shop level)
        console.log(`  🔍 Checking listing business hours`);

        if (!listing.businessHours) {
          console.log(
            `  ❌ Listing "${listing.title}" has no business hours data`
          );
          return false;
        }

        const businessHoursData = listing.businessHours as BusinessHours;
        let matches = false;

        if (hoursValue === "open-now") {
          matches = isServiceOpenNow(businessHoursData, timezone as string);
          console.log(`  🔍 isServiceOpenNow result: ${matches}`);
        } else if (hoursValue === "24-7") {
          matches = isService24_7(businessHoursData);
          console.log(`  🔍 isService24_7 result: ${matches}`);
        } else if (hoursValue === "weekdays") {
          matches = isServiceOpenWeekdays(businessHoursData);
          console.log(`  🔍 isServiceOpenWeekdays result: ${matches}`);
        } else if (hoursValue === "weekends") {
          matches = isServiceOpenWeekends(businessHoursData);
          console.log(`  🔍 isServiceOpenWeekends result: ${matches}`);
        }

        if (matches) {
          console.log(
            `✅ Listing "${listing.title}" matches ${hoursValue} criteria`
          );
        } else {
          console.log(
            `❌ Listing "${listing.title}" does NOT match ${hoursValue} criteria`
          );
        }

        return matches;
      });

      console.log(`📊 Filtered listings count: ${filteredListings.length}`);
    }

    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // console.log("🎯 Final response data:");
    console.log("  - Final filteredListings count:", filteredListings.length);
    console.log("  - Final filteredListings:", filteredListings);
    console.log("  - First 3 final listings:");
    filteredListings.slice(0, 3).forEach((listing: any, index: number) => {
      console.log(`    ${index + 1}. ${listing.title}`);
      if (listing.services && listing.services.length > 0) {
        const minPrice = Math.min(...listing.services.map((s: any) => s.price));
        console.log(`       - Min Price: ${minPrice}`);
      } else {
        console.log(`       - No services`);
      }
    });

    return res.json({
      success: true,
      data: {
        listings: filteredListings,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          total,
          pages: totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching service listings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get a single service listing by ID
export const getServiceListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.serviceListing.findUnique({
      where: { id },
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
            categoryIds: true,
            categoryPaths: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Service listing not found",
      });
    }

    console.log("=== SERVICE LISTING BY ID DEBUG ===");
    console.log("Listing ID:", id);
    console.log("Listing Title:", listing.title);
    console.log("Listing addressId:", listing.addressId);
    console.log("Listing address object:", listing.address);
    console.log("===================================");

    return res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error fetching service listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get service listings by vendor with pagination
export const getServiceListingsByVendor = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const startTime = Date.now();

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Extract pagination parameters from query
    const {
      page = 1,
      limit = 20,
      cursor,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = req.query as PaginationParams;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page.toString()));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit.toString()))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    // Build where clause
    const whereClause: any = { vendorId: vendor.id };
    if (status) {
      whereClause.status = status;
    }

    // Build orderBy clause
    const orderByClause: any = {};
    orderByClause[sortBy] = sortOrder;

    // Get total count for pagination metadata
    const totalCount = await prisma.serviceListing.count({
      where: whereClause,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Fetch listings with pagination
    const listings = await prisma.serviceListing.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        address: true,
        services: {
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
            categoryIds: true,
            categoryPaths: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: orderByClause,
      skip,
      take: limitNum,
    });

    // Debug logging for services
    console.log("=== BACKEND SERVICE LISTINGS DEBUG ===");
    listings.forEach((listing, index) => {
      console.log(`Listing ${index + 1}: ${listing.title}`);
      console.log(`  Status: ${listing.status}`);
      console.log(`  Services count: ${listing.services.length}`);
      if (listing.services.length > 0) {
        listing.services.forEach((service, sIndex) => {
          console.log(`    Service ${sIndex + 1}: ${service.name}`);
          console.log(
            `      Price: ${service.price} (type: ${typeof service.price})`
          );
          console.log(
            `      Discount Price: ${
              service.discountPrice
            } (type: ${typeof service.discountPrice})`
          );
        });
      }
    });
    console.log("=====================================");

    // Generate cursors for cursor-based pagination (optional)
    const nextCursor = hasNextPage
      ? Buffer.from(
          `${pageNum + 1}:${limitNum}:${sortBy}:${sortOrder}`
        ).toString("base64")
      : undefined;
    const previousCursor = hasPreviousPage
      ? Buffer.from(
          `${pageNum - 1}:${limitNum}:${sortBy}:${sortOrder}`
        ).toString("base64")
      : undefined;

    const requestTime = Date.now() - startTime;

    const response: PaginatedResponse<any> = {
      data: listings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        nextCursor,
        previousCursor,
      },
      meta: {
        requestTime,
        cacheHit: false, // TODO: Implement caching
      },
    };

    return res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("Error fetching vendor service listings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Interface for flexible update request
interface FlexibleUpdateRequest {
  // Basic fields (optional)
  title?: string;
  description?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  image?: string;
  status?: "DRAFT" | "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE";

  // ServiceListing specific fields (optional)
  isServiceOn?: boolean; // Turn service listing on/off
  isFeatured?: boolean; // Featured listing flag
  rating?: number; // Listing rating
  totalReviews?: number; // Total review count
  totalBookings?: number; // Total booking count

  // Address (optional)
  addressId?: string;

  // Business hours (optional) - shop level
  businessHours?: BusinessHours;

  // Category (optional)
  categoryId?: string;
  categoryPath?: string[];

  // Services (flexible operations)
  services?: {
    add?: {
      name: string;
      description: string;
      price?: number; // ✅ Made optional to match schema
      discountPrice?: number;
      duration?: string; // ✅ Made optional to match schema
      currency?: string; // Service currency
      status?: "DRAFT" | "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE"; // Service status
      isServiceOn?: boolean; // Turn individual service on/off
      rating?: number; // Service rating
      totalReviews?: number; // Service review count
      totalBookings?: number; // Service booking count
      categoryId?: string; // Single category (backward compatibility)
      categoryIds?: string[]; // ✅ Updated to array
      categoryPaths?: any; // ✅ Updated to JSON
    }[];
    update?: {
      id: string;
      name?: string;
      description?: string;
      price?: number; // ✅ Made optional to match schema
      discountPrice?: number;
      duration?: string; // ✅ Made optional to match schema
      currency?: string; // Service currency
      status?: "DRAFT" | "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE"; // Service status
      isServiceOn?: boolean; // Turn individual service on/off
      rating?: number; // Service rating
      totalReviews?: number; // Service review count
      totalBookings?: number; // Service booking count
      categoryId?: string; // Single category (backward compatibility)
      categoryIds?: string[]; // ✅ Updated to array
      categoryPaths?: any; // ✅ Updated to JSON
    }[];
    remove?: string[]; // service IDs to remove
    replace?: {
      name: string;
      description: string;
      price?: number; // ✅ Made optional to match schema
      discountPrice?: number;
      duration?: string; // ✅ Made optional to match schema
      currency?: string; // Service currency
      status?: "DRAFT" | "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE"; // Service status
      isServiceOn?: boolean; // Turn individual service on/off
      rating?: number; // Service rating
      totalReviews?: number; // Service review count
      totalBookings?: number; // Service booking count
      categoryId?: string; // Single category (backward compatibility)
      categoryIds?: string[]; // ✅ Updated to array
      categoryPaths?: any; // ✅ Updated to JSON
    }[]; // replace all services
  };
}

// Update a service listing with flexible operations
export const updateServiceListing = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("=== FLEXIBLE UPDATE SERVICE LISTING START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request body keys:", Object.keys(req.body || {}));
  console.log("Listing ID:", req.params.id);
  console.log("User ID:", req.user?.id);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify vendor owns this listing
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    // Get existing listing with all relations
    const existingListing = await prisma.serviceListing.findFirst({
      where: {
        id,
        vendorId: vendor.id,
      },
      include: {
        services: true,
        address: true,
        category: true,
      },
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Service listing not found or access denied",
      });
    }

    console.log("=== EXISTING LISTING DATA ===");
    console.log("Existing listing:", JSON.stringify(existingListing, null, 2));
    console.log("=============================");

    const updateRequest: FlexibleUpdateRequest = req.body;

    // Process the flexible update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let updateData: any = {};
      let servicesChanged = false;
      let servicesToCreate: any[] = [];
      let servicesToUpdate: any[] = [];
      let servicesToDelete: string[] = [];

      // 1. Process basic field updates
      if (updateRequest.title !== undefined) {
        updateData.title = updateRequest.title.trim();
        console.log("📝 Updating title:", updateData.title);
      }

      if (updateRequest.description !== undefined) {
        updateData.description = updateRequest.description.trim();
        console.log("📝 Updating description");
      }

      if (updateRequest.contactNumber !== undefined) {
        updateData.contactNumber = updateRequest.contactNumber.trim();
        console.log("📝 Updating contact number");
      }

      if (updateRequest.whatsappNumber !== undefined) {
        updateData.whatsappNumber = updateRequest.whatsappNumber.trim();
        console.log("📝 Updating WhatsApp number");
      }

      if (updateRequest.status !== undefined) {
        updateData.status = updateRequest.status;
        console.log("📝 Updating status:", updateRequest.status);
      }

      if (updateRequest.isServiceOn !== undefined) {
        updateData.isServiceOn = updateRequest.isServiceOn;
        console.log("📝 Updating isServiceOn:", updateRequest.isServiceOn);
      }

      if (updateRequest.isFeatured !== undefined) {
        updateData.isFeatured = updateRequest.isFeatured;
        console.log("📝 Updating isFeatured:", updateRequest.isFeatured);
      }

      if (updateRequest.rating !== undefined) {
        updateData.rating = updateRequest.rating;
        console.log("📝 Updating rating:", updateRequest.rating);
      }

      if (updateRequest.totalReviews !== undefined) {
        updateData.totalReviews = updateRequest.totalReviews;
        console.log("📝 Updating totalReviews:", updateRequest.totalReviews);
      }

      if (updateRequest.totalBookings !== undefined) {
        updateData.totalBookings = updateRequest.totalBookings;
        console.log("📝 Updating totalBookings:", updateRequest.totalBookings);
      }

      if (updateRequest.image !== undefined) {
        let finalImageUrl = updateRequest.image;

        // Check if the new image is a local URI that needs to be uploaded to Cloudinary
        if (
          updateRequest.image &&
          (updateRequest.image.startsWith("file://") ||
            updateRequest.image.startsWith("content://"))
        ) {
          console.log(
            "📤 Local image URI detected, uploading to Cloudinary:",
            updateRequest.image
          );

          try {
            // For local URIs, we need to read the file and upload it
            // This is a simplified approach - in production, you might want to use a different method
            const fs = await import("fs");
            const path = await import("path");

            // Extract file path from URI
            const filePath = updateRequest.image
              .replace("file://", "")
              .replace("content://", "");

            if (fs.existsSync(filePath)) {
              const fileBuffer = fs.readFileSync(filePath);
              const filename = path.basename(filePath);

              // Upload buffer to Cloudinary
              const { uploadBufferToCloudinary } = await import(
                "@/utils/upload"
              );
              finalImageUrl = await uploadBufferToCloudinary(
                fileBuffer,
                "listro/service-images",
                filename
              );
              console.log("✅ Image uploaded to Cloudinary:", finalImageUrl);

              // Clean up local file after successful upload
              deleteLocalFile(filePath);
            } else {
              console.log("❌ Local file not found:", filePath);
              throw new Error("Local image file not found");
            }
          } catch (uploadError) {
            console.error(
              "❌ Failed to upload local image to Cloudinary:",
              uploadError
            );
            throw new Error("Failed to upload image to Cloudinary");
          }
        }

        // Check if we need to delete the old image from Cloudinary
        if (existingListing.image && existingListing.image !== finalImageUrl) {
          console.log(
            "🗑️ Deleting old image from Cloudinary:",
            existingListing.image
          );
          try {
            // Extract public_id from Cloudinary URL
            const oldImageUrl = existingListing.image;
            if (oldImageUrl.includes("cloudinary.com")) {
              // Extract public_id from URL like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
              const urlParts = oldImageUrl.split("/");
              const uploadIndex = urlParts.findIndex(
                (part) => part === "upload"
              );
              if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
                const publicId = urlParts
                  .slice(uploadIndex + 2)
                  .join("/")
                  .replace(/\.[^/.]+$/, ""); // Remove file extension
                console.log("Extracted public_id:", publicId);

                // Import cloudinary at the top of the function
                const { v2: cloudinary } = await import("cloudinary");
                await cloudinary.uploader.destroy(publicId);
                console.log("✅ Old image deleted from Cloudinary");
              }
            }
          } catch (deleteError) {
            console.error(
              "❌ Failed to delete old image from Cloudinary:",
              deleteError
            );
            // Don't fail the entire update if image deletion fails
          }
        }

        updateData.image = finalImageUrl || null;
        console.log("📝 Updating image");
        console.log("Original image URL:", updateRequest.image);
        console.log("Final image URL:", finalImageUrl);
        console.log("Setting image to:", updateData.image);
      }

      // 2. Process address update
      if (updateRequest.addressId !== undefined) {
        // Verify the address belongs to the vendor
        const address = await tx.businessAddress.findFirst({
          where: {
            id: updateRequest.addressId,
            vendorId: vendor.id,
          },
        });

        if (!address) {
          throw new Error(
            "Invalid address or address does not belong to vendor"
          );
        }

        updateData.addressId = updateRequest.addressId;
        console.log("🏠 Updating address:", updateRequest.addressId);
      }

      // 3. Process business hours update (shop level)
      if (updateRequest.businessHours !== undefined) {
        updateData.businessHours = updateRequest.businessHours;
        console.log(
          "🕐 Updating business hours:",
          JSON.stringify(updateRequest.businessHours, null, 2)
        );
      }

      // 4. Process category update
      if (updateRequest.categoryId !== undefined) {
        // Verify the category exists
        const category = await tx.category.findUnique({
          where: { id: updateRequest.categoryId },
        });

        if (!category) {
          throw new Error(
            "The selected category does not exist or has been deleted"
          );
        }

        updateData.categoryId = updateRequest.categoryId;
        updateData.categoryPath = updateRequest.categoryPath || [];
        console.log("📂 Updating category:", updateRequest.categoryId);
      }

      // Helper function to convert duration to minutes
      const convertDurationToMinutes = (duration: string): number | null => {
        if (!duration?.trim()) return null;
        const timeParts = duration.trim().split(":");
        if (timeParts.length === 2) {
          const hours = parseInt(timeParts[0] || "0") || 0;
          const minutes = parseInt(timeParts[1] || "0") || 0;
          return hours * 60 + minutes;
        }
        return null;
      };

      // Helper function to validate category IDs
      const validateCategoryIds = async (
        categoryIds: string[]
      ): Promise<void> => {
        if (categoryIds.length > 0) {
          const existingCategories = await tx.category.findMany({
            where: {
              id: { in: categoryIds },
              isActive: true,
            },
            select: { id: true },
          });

          if (existingCategories.length !== categoryIds.length) {
            throw new Error(
              "One or more category IDs do not exist or are inactive"
            );
          }
        }
      };

      // Helper function to validate single category ID
      const validateCategoryId = async (
        categoryId: string | null
      ): Promise<void> => {
        if (categoryId) {
          const existingCategory = await tx.category.findUnique({
            where: {
              id: categoryId,
              isActive: true,
            },
            select: { id: true },
          });

          if (!existingCategory) {
            throw new Error("Category ID does not exist or is inactive");
          }
        }
      };

      // ========================================
      // DEEP CATEGORY FILTERING HELPER FUNCTIONS
      // ========================================
      // These functions enable comprehensive category-based filtering:
      // 1. getCategoryHierarchy() - Get full path from root to category
      // 2. getAllChildCategories() - Get all descendants (deep down)
      // 3. getAllParentCategories() - Get all ancestors (deep up)
      // 4. getSiblingCategories() - Get categories at same level
      // 5. getAllRelatedCategories() - Get all related (parents + siblings + children)
      // 6. getCategoriesByDepth() - Get categories at specific depth level

      // Helper function to get category hierarchy for filtering
      const getCategoryHierarchy = async (
        categoryId: string
      ): Promise<string[]> => {
        const category = await tx.category.findUnique({
          where: { id: categoryId },
          select: { id: true, parentId: true },
        });

        if (!category) return [];

        const hierarchy = [category.id];
        let currentParentId = category.parentId;

        // Traverse up the hierarchy
        while (currentParentId) {
          const parent = await tx.category.findUnique({
            where: { id: currentParentId },
            select: { id: true, parentId: true },
          });

          if (parent) {
            hierarchy.unshift(parent.id);
            currentParentId = parent.parentId;
          } else {
            break;
          }
        }

        return hierarchy;
      };

      // Helper function to get all child categories for filtering (deep down)
      const getAllChildCategories = async (
        categoryId: string
      ): Promise<string[]> => {
        const children = await tx.category.findMany({
          where: { parentId: categoryId, isActive: true },
          select: { id: true },
        });

        let allChildren = children.map((child) => child.id);

        // Recursively get children of children
        for (const child of children) {
          const grandChildren = await getAllChildCategories(child.id);
          allChildren = [...allChildren, ...grandChildren];
        }

        return allChildren;
      };

      // Helper function to get all parent categories for filtering (deep up)
      const getAllParentCategories = async (
        categoryId: string
      ): Promise<string[]> => {
        const category = await tx.category.findUnique({
          where: { id: categoryId },
          select: { id: true, parentId: true },
        });

        if (!category || !category.parentId) return [];

        const parents = [category.parentId];
        let currentParentId = category.parentId;

        // Traverse up the hierarchy
        while (currentParentId) {
          const parent = await tx.category.findUnique({
            where: { id: currentParentId },
            select: { id: true, parentId: true },
          });

          if (parent && parent.parentId) {
            parents.push(parent.parentId);
            currentParentId = parent.parentId;
          } else {
            break;
          }
        }

        return parents;
      };

      // Helper function to get sibling categories for filtering (same level)
      const getSiblingCategories = async (
        categoryId: string
      ): Promise<string[]> => {
        const category = await tx.category.findUnique({
          where: { id: categoryId },
          select: { parentId: true },
        });

        if (!category || !category.parentId) return [];

        const siblings = await tx.category.findMany({
          where: {
            parentId: category.parentId,
            isActive: true,
            id: { not: categoryId }, // Exclude the current category
          },
          select: { id: true },
        });

        return siblings.map((sibling) => sibling.id);
      };

      // Helper function to get all related categories (parents + siblings + children)
      const getAllRelatedCategories = async (
        categoryId: string
      ): Promise<string[]> => {
        const [parents, siblings, children] = await Promise.all([
          getAllParentCategories(categoryId),
          getSiblingCategories(categoryId),
          getAllChildCategories(categoryId),
        ]);

        return [...parents, ...siblings, ...children, categoryId]; // Include the category itself
      };

      // Helper function to get categories by depth level
      const getCategoriesByDepth = async (
        categoryId: string,
        depth: number
      ): Promise<string[]> => {
        if (depth === 0) return [categoryId];

        const children = await tx.category.findMany({
          where: { parentId: categoryId, isActive: true },
          select: { id: true },
        });

        if (depth === 1) {
          return children.map((child) => child.id);
        }

        let result: string[] = [];
        for (const child of children) {
          const deeperChildren = await getCategoriesByDepth(
            child.id,
            depth - 1
          );
          result = [...result, ...deeperChildren];
        }

        return result;
      };

      // 5. Process services operations
      if (updateRequest.services) {
        servicesChanged = true;
        console.log("=== SERVICES UPDATE OPERATIONS ===");
        console.log(
          "🔧 Processing services operations:",
          JSON.stringify(updateRequest.services, null, 2)
        );
        console.log(
          "Services operations keys:",
          Object.keys(updateRequest.services)
        );

        // Handle replace operation (replace all services)
        if (updateRequest.services.replace) {
          console.log("🔄 REPLACE OPERATION DETECTED");
          console.log(
            "📋 Original services to replace:",
            updateRequest.services.replace.length
          );
          console.log(
            "📋 Services to replace data:",
            JSON.stringify(updateRequest.services.replace, null, 2)
          );

          servicesToDelete = existingListing.services.map((s) => s.id);
          console.log("📋 Existing services to delete:", servicesToDelete);

          // Filter out services with empty names
          const validServices = updateRequest.services.replace.filter(
            (service) => service.name && service.name.trim().length > 0
          );
          console.log(
            "📋 Valid services after name filtering:",
            validServices.length
          );
          console.log(
            "📋 Valid services data:",
            JSON.stringify(validServices, null, 2)
          );

          // Validate categories for all services before creating
          for (const service of validServices) {
            if (service.categoryIds && service.categoryIds.length > 0) {
              await validateCategoryIds(service.categoryIds);
            }
            if (service.categoryId) {
              await validateCategoryId(service.categoryId);
            }
          }

          servicesToCreate = await Promise.all(
            validServices.map(async (service) => {
              // Automatically build category paths from category IDs
              let categoryPaths = service.categoryPaths || [];
              if (service.categoryIds && service.categoryIds.length > 0) {
                console.log(
                  `🔧 Building category paths for new service: ${service.name}`
                );
                console.log(`Category IDs:`, service.categoryIds);

                try {
                  const builtPaths = await buildCategoryPathsFromIds(
                    service.categoryIds
                  );
                  categoryPaths = builtPaths;
                  console.log(`✅ Built category paths:`, builtPaths);
                } catch (error) {
                  console.error(
                    `❌ Failed to build category paths for service ${service.name}:`,
                    error
                  );
                  // Fall back to provided paths or empty array
                  categoryPaths = service.categoryPaths || [];
                }
              }

              return {
                listingId: id,
                name: service.name.trim(),
                description: service.description.trim(),
                price: service.price !== undefined ? service.price : null,
                discountPrice: service.discountPrice || null,
                duration: service.duration
                  ? convertDurationToMinutes(service.duration)
                  : null,
                currency: service.currency || "INR",
                status: service.status || "DRAFT",
                isServiceOn:
                  service.isServiceOn !== undefined
                    ? service.isServiceOn
                    : true,
                rating: service.rating || 0,
                totalReviews: service.totalReviews || 0,
                totalBookings: service.totalBookings || 0,
                categoryId: service.categoryId || null,
                categoryIds: service.categoryIds || [],
                categoryPaths: categoryPaths, // Use automatically built or provided category paths
              };
            })
          );

          console.log("📋 Services to create:", servicesToCreate.length);
        } else {
          // Handle individual operations
          if (updateRequest.services.add) {
            console.log(
              "➕ Adding services:",
              updateRequest.services.add.length
            );
            // Filter out services with empty names
            const validServices = updateRequest.services.add.filter(
              (service) => service.name && service.name.trim().length > 0
            );

            // Validate categories for all services before creating
            for (const service of validServices) {
              if (service.categoryIds && service.categoryIds.length > 0) {
                await validateCategoryIds(service.categoryIds);
              }
              if (service.categoryId) {
                await validateCategoryId(service.categoryId);
              }
            }

            servicesToCreate = await Promise.all(
              validServices.map(async (service) => {
                // Automatically build category paths from category IDs
                let categoryPaths = service.categoryPaths || [];
                if (service.categoryIds && service.categoryIds.length > 0) {
                  console.log(
                    `🔧 Building category paths for new service: ${service.name}`
                  );
                  console.log(`Category IDs:`, service.categoryIds);

                  try {
                    const builtPaths = await buildCategoryPathsFromIds(
                      service.categoryIds
                    );
                    categoryPaths = builtPaths;
                    console.log(`✅ Built category paths:`, builtPaths);
                  } catch (error) {
                    console.error(
                      `❌ Failed to build category paths for service ${service.name}:`,
                      error
                    );
                    // Fall back to provided paths or empty array
                    categoryPaths = service.categoryPaths || [];
                  }
                }

                return {
                  listingId: id,
                  name: service.name.trim(),
                  description: service.description.trim(),
                  price: service.price !== undefined ? service.price : null,
                  discountPrice: service.discountPrice || null,
                  duration: service.duration
                    ? convertDurationToMinutes(service.duration)
                    : null,
                  currency: service.currency || "INR",
                  status: service.status || "DRAFT",
                  isServiceOn:
                    service.isServiceOn !== undefined
                      ? service.isServiceOn
                      : true,
                  rating: service.rating || 0,
                  totalReviews: service.totalReviews || 0,
                  totalBookings: service.totalBookings || 0,
                  categoryId: service.categoryId || null,
                  categoryIds: service.categoryIds || [],
                  categoryPaths: categoryPaths, // Use automatically built or provided category paths
                };
              })
            );
          }

          if (updateRequest.services.update) {
            console.log(
              "✏️ Updating services:",
              updateRequest.services.update.length
            );
            servicesToUpdate = updateRequest.services.update;
          }

          if (updateRequest.services.remove) {
            console.log("🗑️ Removing services:", updateRequest.services.remove);
            servicesToDelete = updateRequest.services.remove;
          }
        }

        // Validate services before processing
        const allServicesToValidate = [
          ...servicesToCreate,
          ...servicesToUpdate,
        ];
        for (const service of allServicesToValidate) {
          if (!service.name?.trim() || !service.description?.trim()) {
            throw new Error(
              "Each service must have a valid name and description"
            );
          }

          // Validate price if provided
          if (service.price !== undefined && service.price !== null) {
            if (service.price <= 0) {
              throw new Error(
                "Service price must be greater than 0 if provided"
              );
            }
          }

          // Validate duration if provided
          if (service.duration !== undefined && service.duration !== null) {
            if (service.duration <= 0) {
              throw new Error(
                "Service duration must be greater than 0 if provided"
              );
            }
          }
          if (
            service.discountPrice !== undefined &&
            service.discountPrice !== null &&
            service.discountPrice < 0
          ) {
            throw new Error("Discount price must be 0 or greater");
          }
          if (
            service.discountPrice !== undefined &&
            service.discountPrice !== null &&
            service.price !== undefined &&
            service.price !== null &&
            service.discountPrice >= service.price
          ) {
            throw new Error("Discount price must be less than the base price");
          }
        }
      }

      // 6. Apply updates
      let updatedListing;

      if (Object.keys(updateData).length > 0) {
        console.log("💾 Updating listing with data:", updateData);
        console.log("Update data keys:", Object.keys(updateData));
        console.log("Image in update data:", updateData.image);
        updatedListing = await tx.serviceListing.update({
          where: { id },
          data: updateData,
        });
        console.log("✅ Database update completed");
      } else {
        console.log("⚠️ No update data, skipping database update");
        updatedListing = existingListing;
      }

      // 7. Process services changes
      if (servicesChanged) {
        // Delete services
        if (servicesToDelete.length > 0) {
          console.log("🗑️ Deleting services:", servicesToDelete);
          await tx.service.deleteMany({
            where: {
              id: { in: servicesToDelete },
              listingId: id,
            },
          });
        }

        // Update services
        for (const serviceUpdate of servicesToUpdate) {
          console.log("✏️ Updating service:", serviceUpdate.id);
          const updateData: any = {};

          if (serviceUpdate.name !== undefined) {
            updateData.name = serviceUpdate.name.trim();
          }
          if (serviceUpdate.description !== undefined) {
            updateData.description = serviceUpdate.description.trim();
          }
          if (serviceUpdate.price !== undefined) {
            updateData.price =
              serviceUpdate.price !== null ? serviceUpdate.price : null;
          }
          if (serviceUpdate.discountPrice !== undefined) {
            updateData.discountPrice =
              serviceUpdate.discountPrice !== null
                ? serviceUpdate.discountPrice
                : null;
          }
          if (serviceUpdate.duration !== undefined) {
            updateData.duration = serviceUpdate.duration
              ? convertDurationToMinutes(serviceUpdate.duration)
              : null;
          }
          if (serviceUpdate.categoryIds !== undefined) {
            // Validate that all category IDs exist
            if (serviceUpdate.categoryIds.length > 0) {
              const existingCategories = await tx.category.findMany({
                where: {
                  id: { in: serviceUpdate.categoryIds },
                  isActive: true,
                },
                select: { id: true },
              });

              if (
                existingCategories.length !== serviceUpdate.categoryIds.length
              ) {
                throw new Error(
                  "One or more category IDs do not exist or are inactive"
                );
              }
            }
            updateData.categoryIds = serviceUpdate.categoryIds;

            // Automatically rebuild category paths when categoryIds change
            if (serviceUpdate.categoryIds.length > 0) {
              console.log(
                `🔧 Rebuilding category paths for service update: ${serviceUpdate.id}`
              );
              console.log(`Category IDs:`, serviceUpdate.categoryIds);

              try {
                const builtPaths = await buildCategoryPathsFromIds(
                  serviceUpdate.categoryIds
                );
                updateData.categoryPaths = builtPaths;
                console.log(`✅ Rebuilt category paths:`, builtPaths);
              } catch (error) {
                console.error(
                  `❌ Failed to rebuild category paths for service ${serviceUpdate.id}:`,
                  error
                );
                // Keep existing categoryPaths if rebuild fails
              }
            } else {
              // If no categoryIds, clear categoryPaths
              updateData.categoryPaths = [];
            }
          }
          if (serviceUpdate.categoryPaths !== undefined) {
            // Only use provided categoryPaths if categoryIds are not being updated
            if (serviceUpdate.categoryIds === undefined) {
              updateData.categoryPaths = serviceUpdate.categoryPaths;
            }
            // If categoryIds are also being updated, the automatically built paths take precedence
          }
          if (serviceUpdate.currency !== undefined) {
            updateData.currency = serviceUpdate.currency;
          }
          if (serviceUpdate.status !== undefined) {
            updateData.status = serviceUpdate.status;
          }
          if (serviceUpdate.isServiceOn !== undefined) {
            updateData.isServiceOn = serviceUpdate.isServiceOn;
          }
          if (serviceUpdate.rating !== undefined) {
            updateData.rating = serviceUpdate.rating;
          }
          if (serviceUpdate.totalReviews !== undefined) {
            updateData.totalReviews = serviceUpdate.totalReviews;
          }
          if (serviceUpdate.totalBookings !== undefined) {
            updateData.totalBookings = serviceUpdate.totalBookings;
          }
          if (serviceUpdate.categoryId !== undefined) {
            // Validate that the category ID exists
            if (serviceUpdate.categoryId) {
              const existingCategory = await tx.category.findUnique({
                where: {
                  id: serviceUpdate.categoryId,
                  isActive: true,
                },
                select: { id: true },
              });

              if (!existingCategory) {
                throw new Error("Category ID does not exist or is inactive");
              }
            }
            updateData.categoryId = serviceUpdate.categoryId;
          }

          await tx.service.update({
            where: { id: serviceUpdate.id },
            data: updateData,
          });
        }

        // Create new services
        if (servicesToCreate.length > 0) {
          console.log("=== CREATING SERVICES IN UPDATE ===");
          console.log("➕ Creating services:", servicesToCreate.length);
          console.log(
            "Services to create:",
            JSON.stringify(servicesToCreate, null, 2)
          );

          const createdServices = await tx.service.createMany({
            data: servicesToCreate,
          });

          console.log("✅ Services created successfully:", createdServices);
          console.log(`Created ${createdServices.count} services`);
        } else {
          console.log("⚠️ No services to create");
        }
      }

      return updatedListing;
    });

    // Ensure service status consistency (if main service is ACTIVE, sub-services should be ACTIVE too)
    await ensureServiceStatusConsistency(result.id, result.status);

    // Fetch the complete updated listing
    const completeListing = await prisma.serviceListing.findUnique({
      where: { id },
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
            categoryIds: true,
            categoryPaths: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    console.log("=== FLEXIBLE UPDATE SUCCESS ===");
    console.log("Updated listing:", JSON.stringify(completeListing, null, 2));
    console.log("Final image URL:", completeListing?.image);
    console.log(
      "Final services count:",
      completeListing?.services?.length || 0
    );
    if (completeListing?.services) {
      completeListing.services.forEach((service, index) => {
        console.log(`Final Service ${index + 1}:`, {
          id: service.id,
          name: service.name,
          price: service.price,
          categoryIds: service.categoryIds,
          categoryPaths: service.categoryPaths,
          status: service.status,
        });
      });
    }
    console.log("===============================");

    return res.json({
      success: true,
      message: "Service listing updated successfully",
      data: completeListing,
    });
  } catch (error) {
    console.error("=== FLEXIBLE UPDATE ERROR ===");
    console.error("Error details:", error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("=============================");

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Delete a service listing
export const deleteServiceListing = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify vendor owns this listing
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: "User is not a vendor",
      });
    }

    const existingListing = await prisma.serviceListing.findFirst({
      where: {
        id,
        vendorId: vendor.id,
      },
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Service listing not found or access denied",
      });
    }

    // For DRAFT and OFF_SERVICE listings, permanently delete from database
    // For other statuses, soft delete by setting status to OFF_SERVICE
    if (
      existingListing.status === "DRAFT" ||
      existingListing.status === "OFF_SERVICE"
    ) {
      console.log(
        "🗑️ Permanently deleting",
        existingListing.status,
        "listing:",
        id
      );

      // Delete image from Cloudinary if it exists
      if (existingListing.image) {
        try {
          console.log(
            "🖼️ Deleting image from Cloudinary:",
            existingListing.image
          );
          const publicId = extractPublicId(existingListing.image);
          await deleteFromCloudinary(publicId);
          console.log("✅ Image deleted from Cloudinary successfully");
        } catch (imageError) {
          console.error(
            "⚠️ Failed to delete image from Cloudinary:",
            imageError
          );
          // Continue with database deletion even if image deletion fails
        }
      }

      // Delete all related services first (due to foreign key constraints)
      await prisma.service.deleteMany({
        where: { listingId: id },
      });

      // Delete the service listing
      await prisma.serviceListing.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: `${existingListing.status} service listing permanently deleted`,
      });
    } else {
      console.log("🔄 Soft deleting", existingListing.status, "listing:", id);

      // Soft delete by setting status to OFF_SERVICE
      await prisma.serviceListing.update({
        where: { id },
        data: { status: "OFF_SERVICE" },
      });

      return res.json({
        success: true,
        message: "Service listing deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting service listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
