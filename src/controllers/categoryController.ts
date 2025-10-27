import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { logger } from "@/utils/logger";

// Get root categories (categories with no parent)
export const getRootCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    console.log(
      "🔍 Backend getRootCategories - Found categories:",
      categories.length
    );
    console.log("🔍 Backend getRootCategories - Categories data:", categories);

    return res.status(200).json({
      success: true,
      data: categories,
      message: "Root categories retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching root categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get children of a specific category
export const getCategoryChildren = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const children = await prisma.category.findMany({
      where: {
        parentId: id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.status(200).json({
      success: true,
      data: children,
      message: "Category children retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching category children:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if category has children
export const checkCategoryHasChildren = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const childCount = await prisma.category.count({
      where: {
        parentId: id,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        hasChildren: childCount > 0,
        childCount,
      },
      message: "Category children check completed",
    });
  } catch (error) {
    logger.error("Error checking category children:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get category by ID with full path
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            Service: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
      message: "Category retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching category by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search categories by query
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const query = q.trim().toLowerCase();

    // Search in category names and paths
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        _count: {
          select: {
            children: true,
            Service: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 50, // Limit results to 50 for performance
    });

    // Build category paths for each result
    const categoriesWithPaths = await Promise.all(
      categories.map(async (category) => {
        let path = category.name;

        // Build full path by traversing up the parent chain
        let currentParentId = category.parentId;
        const pathParts = [category.name];

        while (currentParentId) {
          const parent = await prisma.category.findUnique({
            where: { id: currentParentId },
            select: { name: true, parentId: true },
          });

          if (parent) {
            pathParts.unshift(parent.name);
            currentParentId = parent.parentId;
          } else {
            break;
          }
        }

        path = pathParts.join(" > ");

        return {
          ...category,
          path,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: categoriesWithPaths,
      message: "Categories search completed successfully",
    });
  } catch (error) {
    logger.error("Error searching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all categories as flat list for client-side tree building
export const getAllCategoriesFlat = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        _count: {
          select: {
            children: true,
            Service: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.status(200).json({
      success: true,
      data: categories,
      message: "All categories retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching all categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get full category tree (admin only)
export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    // Build a map of parentId -> children (O(n))
    const categoryMap = new Map<string | null, any[]>();
    categories.forEach((cat) => {
      const parentKey = cat.parentId ?? null;
      if (!categoryMap.has(parentKey)) {
        categoryMap.set(parentKey, []);
      }
      categoryMap.get(parentKey)!.push(cat);
    });

    // Recursive builder using map lookup (O(n))
    const buildTree = (parentId: string | null = null): any[] => {
      return (categoryMap.get(parentId) || []).map((cat) => ({
        ...cat,
        children: buildTree(cat.id),
      }));
    };

    const tree = buildTree();

    return res.status(200).json({
      success: true,
      data: tree,
      message: "Category tree retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching category tree:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId, sortOrder } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // If parentId is provided, validate it exists
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    logger.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, sortOrder, isActive } = req.body;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    // If parentId is provided, validate it exists and doesn't create circular reference
    if (parentId) {
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be its own parent",
        });
      }

      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }

      // Check for circular reference
      const isCircular = await checkCircularReference(id, parentId);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          message: "Cannot set parent: would create circular reference",
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (slug !== existingCategory.slug) updateData.slug = slug;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    logger.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            Service: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has children
    if (category._count.children > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with subcategories. Please delete subcategories first.",
      });
    }

    // Check if category has services
    if (category._count.Service > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with services. Please move or delete services first.",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Helper function to check for circular reference
const checkCircularReference = async (
  categoryId: string,
  newParentId: string
): Promise<boolean> => {
  let currentParentId: string | null = newParentId;

  while (currentParentId) {
    if (currentParentId === categoryId) {
      return true;
    }

    const parent: { parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

    currentParentId = parent?.parentId ?? null;
  }

  return false;
};
