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
  services: {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    businessHours?: BusinessHours;
  }[];
}

// Interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  status?: "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE";
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
  console.log("User ID:", req.user?.id);

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
    console.log("Services:", services);
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

    // Verify the category exists
    const category = await prisma.category.findUnique({
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

    // Verify the address belongs to the vendor
    const address = await prisma.businessAddress.findFirst({
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

    // Validate services array
    if (!services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service is required",
      });
    }

    // Validate each service
    for (const service of services) {
      if (
        !service.name?.trim() ||
        !service.description?.trim() ||
        !service.price ||
        service.price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each service must have a valid name, description, and price > 0",
        });
      }
      if (service.discountPrice !== undefined && service.discountPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be 0 or greater",
        });
      }
      if (
        service.discountPrice !== undefined &&
        service.discountPrice >= service.price
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be less than the base price",
        });
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

      const serviceListing = await tx.serviceListing.create({
        data: {
          vendorId: vendor.id,
          title: title.trim(),
          description: description.trim(),
          categoryId,
          categoryPath,
          contactNumber: contactNumber.trim(),
          whatsappNumber: whatsappNumber.trim(),
          image: image || null,
          addressId: selectedAddressId,
        },
      });

      console.log("✅ Service listing created:", serviceListing.id);

      // Create the individual services
      const createdServices = await Promise.all(
        services.map((service) =>
          tx.service.create({
            data: {
              listingId: serviceListing.id,
              name: service.name.trim(),
              description: service.description.trim(),
              price: service.price,
              discountPrice: service.discountPrice || null,
              businessHours: service.businessHours || businessHours || null,
            },
          })
        )
      );

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
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Handle status filtering - by default show only ACTIVE and ON listings
    if (isActive === "true" || isActive === undefined) {
      where.status = "ACTIVE";
      where.isServiceOn = true; // Only show services that are turned on by vendor
    } else if (isActive === "false") {
      where.OR = [{ status: { not: "ACTIVE" } }, { isServiceOn: false }];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (vendorId) {
      where.vendorId = vendorId as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
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
    if (excludeUserId) {
      where.vendor = {
        user: {
          id: { not: excludeUserId as string },
        },
      };
    }

    // Get listings with relations
    const [listings, total] = await Promise.all([
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

    // Filter by price range if specified
    let filteredListings = listings;
    if (minPrice || maxPrice) {
      filteredListings = listings.filter((listing: any) => {
        if (!listing.services || listing.services.length === 0) return false;

        const minServicePrice = Math.min(
          ...listing.services.map((s: any) => s.price)
        );
        const maxServicePrice = Math.max(
          ...listing.services.map((s: any) => s.price)
        );

        if (minPrice && maxServicePrice < parseFloat(minPrice as string))
          return false;
        if (maxPrice && minServicePrice > parseFloat(maxPrice as string))
          return false;

        return true;
      });
    }

    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

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
  status?: "ACTIVE" | "PENDING" | "REJECTED" | "OFF_SERVICE";

  // Address (optional)
  addressId?: string;

  // Category (optional)
  categoryId?: string;
  categoryPath?: string[];

  // Services (flexible operations)
  services?: {
    add?: {
      name: string;
      description: string;
      price: number;
      discountPrice?: number;
      businessHours?: BusinessHours;
    }[];
    update?: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      discountPrice?: number;
      businessHours?: BusinessHours;
    }[];
    remove?: string[]; // service IDs to remove
    replace?: {
      name: string;
      description: string;
      price: number;
      discountPrice?: number;
      businessHours?: BusinessHours;
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
  console.log("Listing ID:", req.params.id);
  console.log("User ID:", req.user?.id);

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

      if (updateRequest.image !== undefined) {
        // Check if we need to delete the old image from Cloudinary
        if (
          existingListing.image &&
          existingListing.image !== updateRequest.image
        ) {
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

        updateData.image = updateRequest.image || null;
        console.log("📝 Updating image");
        console.log("New image URL:", updateRequest.image);
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

      // 3. Process category update
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

      // 4. Process services operations
      if (updateRequest.services) {
        servicesChanged = true;
        console.log(
          "🔧 Processing services operations:",
          updateRequest.services
        );

        // Handle replace operation (replace all services)
        if (updateRequest.services.replace) {
          console.log("🔄 Replacing all services");
          servicesToDelete = existingListing.services.map((s) => s.id);
          servicesToCreate = updateRequest.services.replace.map((service) => ({
            listingId: id,
            name: service.name.trim(),
            description: service.description.trim(),
            price: service.price,
            discountPrice: service.discountPrice || null,
            businessHours: service.businessHours || null,
          }));
        } else {
          // Handle individual operations
          if (updateRequest.services.add) {
            console.log(
              "➕ Adding services:",
              updateRequest.services.add.length
            );
            servicesToCreate = updateRequest.services.add.map((service) => ({
              listingId: id,
              name: service.name.trim(),
              description: service.description.trim(),
              price: service.price,
              discountPrice: service.discountPrice || null,
              businessHours: service.businessHours || null,
            }));
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
          if (
            !service.name?.trim() ||
            !service.description?.trim() ||
            !service.price ||
            service.price <= 0
          ) {
            throw new Error(
              "Each service must have a valid name, description, and price > 0"
            );
          }
          if (
            service.discountPrice !== undefined &&
            service.discountPrice < 0
          ) {
            throw new Error("Discount price must be 0 or greater");
          }
          if (
            service.discountPrice !== undefined &&
            service.discountPrice >= service.price
          ) {
            throw new Error("Discount price must be less than the base price");
          }
        }
      }

      // 5. Apply updates
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

      // 6. Process services changes
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
          await tx.service.update({
            where: { id: serviceUpdate.id },
            data: {
              name: serviceUpdate.name?.trim(),
              description: serviceUpdate.description?.trim(),
              price: serviceUpdate.price,
              discountPrice: serviceUpdate.discountPrice,
            },
          });
        }

        // Create new services
        if (servicesToCreate.length > 0) {
          console.log("➕ Creating services:", servicesToCreate.length);
          console.log(
            "Services to create:",
            JSON.stringify(servicesToCreate, null, 2)
          );
          const createdServices = await tx.service.createMany({
            data: servicesToCreate,
          });
          console.log("✅ Services created successfully:", createdServices);
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

    // Soft delete by setting status to OFF_SERVICE
    await prisma.serviceListing.update({
      where: { id },
      data: { status: "OFF_SERVICE" },
    });

    return res.json({
      success: true,
      message: "Service listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
