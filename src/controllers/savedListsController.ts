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

// Interface for saved list response
interface SavedListResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  serviceImages: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
  items?: SavedListItemResponse[];
}

// Interface for saved list item response
interface SavedListItemResponse {
  id: string;
  savedListId: string;
  serviceListingId: string;
  addedAt: string;
  notes?: string;
  sortOrder: number;
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
    } | null;
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
    } | null;
  };
}

/**
 * Get all user's saved lists
 * GET /api/v1/users/:userId/saved-lists
 */
export const getUserSavedLists = async (
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
    const { includeItems = false, limit = 50, page = 1, search } = req.query;

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

    // Verify user exists
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

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            {
              name: {
                contains: search as string,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search as string,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    // Get user's saved lists
    const savedLists = await prisma.savedList.findMany({
      where: {
        userId,
        ...searchFilter,
      },
      include: {
        items: {
          include: {
            serviceListing: {
              select: {
                id: true,
                title: true,
                image: true,
                ...(includeItems === "true" && {
                  description: true,
                  rating: true,
                  totalReviews: true,
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
                }),
              },
            },
          },
          orderBy: { sortOrder: "asc" },
          ...(includeItems === "false" && { take: 4 }), // Limit to 4 for thumbnails when not including full items
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const totalCount = await prisma.savedList.count({
      where: {
        userId,
        ...searchFilter,
      },
    });

    // Transform the response
    const transformedLists: SavedListResponse[] = savedLists.map((list) => {
      // Extract service images for thumbnails (always include up to 4)
      const serviceImages =
        list.items?.slice(0, 4).map((item: any) => ({
          id: item.serviceListing.id,
          title: item.serviceListing.title,
          image: item.serviceListing.image || undefined,
        })) || [];

      const baseList = {
        id: list.id,
        userId: list.userId,
        name: list.name,
        description: list.description || undefined,
        color: list.color || undefined,
        icon: list.icon || undefined,
        isPublic: list.isPublic,
        isDefault: list.isDefault,
        sortOrder: list.sortOrder,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        itemCount: list._count.items,
        serviceImages, // Add service images for thumbnails
      };

      if (includeItems === "true" && list.items) {
        return {
          ...baseList,
          items: list.items.map((item: any) => ({
            id: item.id,
            savedListId: item.savedListId,
            serviceListingId: item.serviceListingId,
            addedAt: item.addedAt.toISOString(),
            notes: item.notes || undefined,
            sortOrder: item.sortOrder,
            serviceListing: {
              id: item.serviceListing.id,
              title: item.serviceListing.title,
              description: item.serviceListing.description,
              image: item.serviceListing.image || undefined,
              rating: item.serviceListing.rating,
              totalReviews: item.serviceListing.totalReviews,
              category: {
                id: item.serviceListing.category.id,
                name: item.serviceListing.category.name,
                slug: item.serviceListing.category.slug,
              },
              vendor: {
                id: item.serviceListing.vendor.id,
                businessName: item.serviceListing.vendor.businessName,
                businessEmail: item.serviceListing.vendor.businessEmail,
                businessPhone: item.serviceListing.vendor.businessPhone,
                rating: item.serviceListing.vendor.rating,
              },
              address: {
                id: item.serviceListing.address.id,
                name: item.serviceListing.address.name,
                address: item.serviceListing.address.address,
                city: item.serviceListing.address.city,
                state: item.serviceListing.address.state,
              },
            },
          })),
        };
      }

      return {
        ...baseList,
        items: undefined,
      };
    });

    res.status(200).json({
      success: true,
      data: transformedLists,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
      message: "User saved lists retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting user saved lists:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Create a new saved list
 * POST /api/v1/users/:userId/saved-lists
 */
export const createSavedList = async (
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
    const { name, description, color, icon, isPublic = false } = req.body;

    // Validate required parameters
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "List name is required",
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

    // Check if list name already exists for this user
    const existingList = await prisma.savedList.findFirst({
      where: {
        userId,
        name: name.trim(),
      },
    });

    if (existingList) {
      res.status(409).json({
        success: false,
        message: "A list with this name already exists",
      });
      return;
    }

    // Get the next sort order
    const lastList = await prisma.savedList.findFirst({
      where: { userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (lastList?.sortOrder || 0) + 1;

    // Create the saved list
    const savedList = await prisma.savedList.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        icon: icon || null,
        isPublic: Boolean(isPublic),
        sortOrder: nextSortOrder,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // Transform the response
    const transformedList: SavedListResponse = {
      id: savedList.id,
      userId: savedList.userId,
      name: savedList.name,
      description: savedList.description || undefined,
      color: savedList.color || undefined,
      icon: savedList.icon || undefined,
      isPublic: savedList.isPublic,
      isDefault: savedList.isDefault,
      sortOrder: savedList.sortOrder,
      createdAt: savedList.createdAt.toISOString(),
      updatedAt: savedList.updatedAt.toISOString(),
      itemCount: savedList._count.items,
      serviceImages: [], // Empty for newly created list
    };

    res.status(201).json({
      success: true,
      data: transformedList,
      message: "Saved list created successfully",
    });
  } catch (error) {
    console.error("Error creating saved list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Get a specific saved list with its items
 * GET /api/v1/users/:userId/saved-lists/:listId
 */
export const getSavedListById = async (
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

    const { userId, listId } = req.params;

    // Validate required parameters
    if (!userId || !listId) {
      res.status(400).json({
        success: false,
        message: "User ID and List ID are required",
      });
      return;
    }

    // Get the saved list with items
    const savedList = await prisma.savedList.findFirst({
      where: {
        id: listId,
        userId,
      },
      include: {
        items: {
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
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    if (!savedList) {
      res.status(404).json({
        success: false,
        message: "Saved list not found",
      });
      return;
    }

    // Transform the response
    const transformedList: SavedListResponse = {
      id: savedList.id,
      userId: savedList.userId,
      name: savedList.name,
      description: savedList.description || undefined,
      color: savedList.color || undefined,
      icon: savedList.icon || undefined,
      isPublic: savedList.isPublic,
      isDefault: savedList.isDefault,
      sortOrder: savedList.sortOrder,
      createdAt: savedList.createdAt.toISOString(),
      updatedAt: savedList.updatedAt.toISOString(),
      itemCount: savedList._count.items,
      serviceImages:
        savedList.items?.slice(0, 4).map((item: any) => ({
          id: item.serviceListing.id,
          title: item.serviceListing.title,
          image: item.serviceListing.image || undefined,
        })) || [],
      items: savedList.items.map((item) => ({
        id: item.id,
        savedListId: item.savedListId,
        serviceListingId: item.serviceListingId,
        addedAt: item.addedAt.toISOString(),
        notes: item.notes || undefined,
        sortOrder: item.sortOrder,
        serviceListing: {
          id: item.serviceListing.id,
          title: item.serviceListing.title,
          description: item.serviceListing.description,
          image: item.serviceListing.image || undefined,
          rating: item.serviceListing.rating,
          totalReviews: item.serviceListing.totalReviews,
          category: item.serviceListing.category
            ? {
                id: item.serviceListing.category.id,
                name: item.serviceListing.category.name,
                slug: item.serviceListing.category.slug,
              }
            : null,
          vendor: {
            id: item.serviceListing.vendor.id,
            businessName: item.serviceListing.vendor.businessName,
            businessEmail: item.serviceListing.vendor.businessEmail,
            businessPhone: item.serviceListing.vendor.businessPhone,
            rating: item.serviceListing.vendor.rating,
          },
          address: item.serviceListing.address
            ? {
                id: item.serviceListing.address.id,
                name: item.serviceListing.address.name,
                address: item.serviceListing.address.address,
                city: item.serviceListing.address.city,
                state: item.serviceListing.address.state,
              }
            : null,
        },
      })),
    };

    res.status(200).json({
      success: true,
      data: transformedList,
      message: "Saved list retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting saved list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Update a saved list
 * PUT /api/v1/users/:userId/saved-lists/:listId
 */
export const updateSavedList = async (
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

    const { userId, listId } = req.params;
    const { name, description, color, icon, isPublic, sortOrder } = req.body;

    // Validate required parameters
    if (!userId || !listId) {
      res.status(400).json({
        success: false,
        message: "User ID and List ID are required",
      });
      return;
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.savedList.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!existingList) {
      res.status(404).json({
        success: false,
        message: "Saved list not found",
      });
      return;
    }

    // If name is being updated, check for duplicates
    if (name && name.trim() !== existingList.name) {
      const duplicateList = await prisma.savedList.findFirst({
        where: {
          userId,
          name: name.trim(),
          id: { not: listId },
        },
      });

      if (duplicateList) {
        res.status(409).json({
          success: false,
          message: "A list with this name already exists",
        });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);

    // Update the saved list
    const updatedList = await prisma.savedList.update({
      where: { id: listId },
      data: updateData,
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // Transform the response
    const transformedList: SavedListResponse = {
      id: updatedList.id,
      userId: updatedList.userId,
      name: updatedList.name,
      description: updatedList.description || undefined,
      color: updatedList.color || undefined,
      icon: updatedList.icon || undefined,
      isPublic: updatedList.isPublic,
      isDefault: updatedList.isDefault,
      sortOrder: updatedList.sortOrder,
      createdAt: updatedList.createdAt.toISOString(),
      updatedAt: updatedList.updatedAt.toISOString(),
      itemCount: updatedList._count.items,
      serviceImages: [], // Empty for updated list (would need separate query for images)
    };

    res.status(200).json({
      success: true,
      data: transformedList,
      message: "Saved list updated successfully",
    });
  } catch (error) {
    console.error("Error updating saved list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Delete a saved list
 * DELETE /api/v1/users/:userId/saved-lists/:listId
 */
export const deleteSavedList = async (
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

    const { userId, listId } = req.params;

    // Validate required parameters
    if (!userId || !listId) {
      res.status(400).json({
        success: false,
        message: "User ID and List ID are required",
      });
      return;
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.savedList.findFirst({
      where: {
        id: listId,
        userId,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!existingList) {
      res.status(404).json({
        success: false,
        message: "Saved list not found",
      });
      return;
    }

    // Prevent deletion of default list
    if (existingList.isDefault) {
      res.status(400).json({
        success: false,
        message: "Cannot delete default favorites list",
      });
      return;
    }

    // Delete the saved list (cascade will delete items)
    await prisma.savedList.delete({
      where: { id: listId },
    });

    res.status(200).json({
      success: true,
      data: {
        listId,
        listName: existingList.name,
        deletedItemsCount: existingList._count.items,
      },
      message: "Saved list deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting saved list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Add a service to a saved list
 * POST /api/v1/users/:userId/saved-lists/:listId/items
 */
export const addServiceToList = async (
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

    const { userId, listId } = req.params;
    const { serviceListingId, notes } = req.body;

    // Validate required parameters
    if (!userId || !listId || !serviceListingId) {
      res.status(400).json({
        success: false,
        message: "User ID, List ID, and Service Listing ID are required",
      });
      return;
    }

    // Check if list exists and belongs to user
    const savedList = await prisma.savedList.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!savedList) {
      res.status(404).json({
        success: false,
        message: "Saved list not found",
      });
      return;
    }

    // Verify service listing exists and is active
    const serviceListing = await prisma.serviceListing.findUnique({
      where: { id: serviceListingId },
      select: { id: true, title: true, status: true },
    });

    if (!serviceListing) {
      res.status(404).json({
        success: false,
        message: "Service listing not found",
      });
      return;
    }

    if (serviceListing.status !== "ACTIVE") {
      res.status(400).json({
        success: false,
        message: "Cannot add inactive service to list",
      });
      return;
    }

    // Check if service is already in this list
    const existingItem = await prisma.savedListItem.findUnique({
      where: {
        savedListId_serviceListingId: {
          savedListId: listId,
          serviceListingId,
        },
      },
    });

    if (existingItem) {
      res.status(409).json({
        success: false,
        message: "Service already exists in this list",
      });
      return;
    }

    // Get the next sort order for this list
    const lastItem = await prisma.savedListItem.findFirst({
      where: { savedListId: listId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (lastItem?.sortOrder || 0) + 1;

    // Add service to list
    const savedListItem = await prisma.savedListItem.create({
      data: {
        savedListId: listId,
        serviceListingId,
        notes: notes?.trim() || null,
        sortOrder: nextSortOrder,
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
    const transformedItem: SavedListItemResponse = {
      id: savedListItem.id,
      savedListId: savedListItem.savedListId,
      serviceListingId: savedListItem.serviceListingId,
      addedAt: savedListItem.addedAt.toISOString(),
      notes: savedListItem.notes || undefined,
      sortOrder: savedListItem.sortOrder,
      serviceListing: {
        id: savedListItem.serviceListing.id,
        title: savedListItem.serviceListing.title,
        description: savedListItem.serviceListing.description,
        image: savedListItem.serviceListing.image || undefined,
        rating: savedListItem.serviceListing.rating,
        totalReviews: savedListItem.serviceListing.totalReviews,
        category: savedListItem.serviceListing.category
          ? {
              id: savedListItem.serviceListing.category.id,
              name: savedListItem.serviceListing.category.name,
              slug: savedListItem.serviceListing.category.slug,
            }
          : null,
        vendor: {
          id: savedListItem.serviceListing.vendor.id,
          businessName: savedListItem.serviceListing.vendor.businessName,
          businessEmail: savedListItem.serviceListing.vendor.businessEmail,
          businessPhone: savedListItem.serviceListing.vendor.businessPhone,
          rating: savedListItem.serviceListing.vendor.rating,
        },
        address: savedListItem.serviceListing.address
          ? {
              id: savedListItem.serviceListing.address.id,
              name: savedListItem.serviceListing.address.name,
              address: savedListItem.serviceListing.address.address,
              city: savedListItem.serviceListing.address.city,
              state: savedListItem.serviceListing.address.state,
            }
          : null,
      },
    };

    res.status(201).json({
      success: true,
      data: transformedItem,
      message: "Service added to list successfully",
    });
  } catch (error) {
    console.error("Error adding service to list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Remove a service from a saved list
 * DELETE /api/v1/users/:userId/saved-lists/:listId/items/:itemId
 */
export const removeServiceFromList = async (
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

    const { userId, listId, itemId } = req.params;

    // Validate required parameters
    if (!userId || !listId || !itemId) {
      res.status(400).json({
        success: false,
        message: "User ID, List ID, and Item ID are required",
      });
      return;
    }

    // Check if item exists and belongs to user's list
    const savedListItem = await prisma.savedListItem.findFirst({
      where: {
        id: itemId,
        savedList: {
          id: listId,
          userId,
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

    if (!savedListItem) {
      res.status(404).json({
        success: false,
        message: "Service not found in this list",
      });
      return;
    }

    // Remove service from list
    await prisma.savedListItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({
      success: true,
      data: {
        itemId,
        serviceListingId: savedListItem.serviceListingId,
        serviceTitle: savedListItem.serviceListing.title,
      },
      message: "Service removed from list successfully",
    });
  } catch (error) {
    console.error("Error removing service from list:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Get user's saved lists with service status
 * GET /api/v1/users/:userId/saved-lists/with-service-status/:serviceId
 */
export const getUserSavedListsWithServiceStatus = async (
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
    const { limit = 50, page = 1 } = req.query;

    // Validate required parameters
    if (!userId || !serviceId) {
      res.status(400).json({
        success: false,
        message: "User ID and Service ID are required",
      });
      return;
    }

    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    // Get all user's saved lists with service status
    const savedLists = await prisma.savedList.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          where: {
            serviceListingId: serviceId,
          },
          select: {
            id: true,
            addedAt: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const totalCount = await prisma.savedList.count({
      where: { userId },
    });

    // Transform the response
    const transformedLists = savedLists.map((list) => ({
      id: list.id,
      userId: list.userId,
      name: list.name,
      description: list.description || undefined,
      color: list.color || undefined,
      icon: list.icon || undefined,
      isPublic: list.isPublic,
      isDefault: list.isDefault,
      sortOrder: list.sortOrder,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
      itemCount: list._count.items,
      hasService: list.items.length > 0,
      serviceAddedAt:
        list.items.length > 0
          ? list.items[0]?.addedAt.toISOString()
          : undefined,
    }));

    res.status(200).json({
      success: true,
      data: transformedLists,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      },
      message: "Saved lists with service status retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting saved lists with service status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Check which lists contain a specific service
 * GET /api/v1/users/:userId/saved-lists/status/:serviceId
 */
export const checkServiceListStatus = async (
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

    // Get all lists that contain this service
    const listsWithService = await prisma.savedListItem.findMany({
      where: {
        serviceListingId: serviceId,
        savedList: {
          userId,
        },
      },
      include: {
        savedList: {
          select: {
            id: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });

    // Transform the response
    const listStatus = listsWithService.map((item) => ({
      listId: item.savedList.id,
      listName: item.savedList.name,
      isDefault: item.savedList.isDefault,
      addedAt: item.addedAt.toISOString(),
      notes: item.notes || undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        serviceId,
        isInAnyList: listStatus.length > 0,
        lists: listStatus,
      },
      message: "Service list status retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking service list status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Check if a service is saved by a user (simple boolean check)
 * GET /api/v1/users/:userId/services/:serviceId/saved-status
 */
export const checkServiceSavedStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
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

    if (!userId || !serviceId) {
      res.status(400).json({
        success: false,
        message: "User ID and Service ID are required",
      });
      return;
    }

    // Check if service exists in any of user's saved lists
    const savedItems = await prisma.savedListItem.findMany({
      where: {
        savedList: {
          userId: userId,
        },
        serviceListingId: serviceId,
      },
      select: {
        id: true,
        savedListId: true,
        savedList: {
          select: {
            id: true,
            name: true,
          },
        },
        addedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        serviceId,
        isSaved: savedItems.length > 0,
        savedInLists: savedItems.map((item) => ({
          itemId: item.id,
          listId: item.savedList.id,
          listName: item.savedList.name,
          addedAt: item.addedAt.toISOString(),
        })),
      },
      message: "Service saved status retrieved successfully",
    });
  } catch (error) {
    console.error("Error checking service saved status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export default {
  getUserSavedLists,
  createSavedList,
  getSavedListById,
  updateSavedList,
  deleteSavedList,
  addServiceToList,
  removeServiceFromList,
  checkServiceListStatus,
  getUserSavedListsWithServiceStatus,
  checkServiceSavedStatus,
};
