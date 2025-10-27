import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all descendants (children, grandchildren, great-grandchildren, etc.) of given category IDs
 * This function recursively fetches all levels of children for deep filtering
 */
export const getAllCategoryDescendants = async (
  categoryIds: string[]
): Promise<string[]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  const allDescendantIds = new Set<string>();

  // Add the original category IDs
  categoryIds.forEach((id) => allDescendantIds.add(id));

  // Recursively get all children at all levels
  const getChildrenRecursively = async (parentIds: string[]): Promise<void> => {
    if (parentIds.length === 0) return;

    // Get direct children of the current level
    const children = await prisma.category.findMany({
      where: {
        parentId: { in: parentIds },
      },
      select: { id: true },
    });

    const childIds = children.map((child) => child.id);

    // Add children to the set
    childIds.forEach((id) => allDescendantIds.add(id));

    // Recursively get children of children
    if (childIds.length > 0) {
      await getChildrenRecursively(childIds);
    }
  };

  // Start the recursive process
  await getChildrenRecursively(categoryIds);

  return Array.from(allDescendantIds);
};

/**
 * Validate that subcategory IDs belong to the specified parent category
 * This ensures users can't select subcategories from different parent categories
 */
export const validateSubcategoryIds = async (
  parentCategoryId: string,
  subcategoryIds: string[]
): Promise<string[]> => {
  if (!subcategoryIds || subcategoryIds.length === 0) {
    return [];
  }

  // Get all descendants of the parent category
  const validDescendantIds = await getAllCategoryDescendants([
    parentCategoryId,
  ]);

  // Filter subcategoryIds to only include valid ones
  const validSubcategoryIds = subcategoryIds.filter((id) =>
    validDescendantIds.includes(id)
  );

  console.log(
    `🔍 Validated subcategory IDs: ${validSubcategoryIds.length}/${subcategoryIds.length} valid`
  );

  return validSubcategoryIds;
};

/**
 * Build category filter for service queries
 * Handles both parent category filtering and deep subcategory filtering
 * ALWAYS applies deep filtering for maximum flexibility
 * NEW: Also filters by individual services categories
 */
export const buildCategoryFilter = async (
  categoryId?: string,
  subcategoryIds?: string[]
): Promise<any> => {
  // If no category filter, return empty filter
  if (!categoryId || categoryId === "all") {
    return {};
  }

  // Get category IDs to filter by (with deep filtering)
  let categoryIdsToFilter: string[] = [];

  if (subcategoryIds && subcategoryIds.length > 0) {
    console.log(
      `🔍 Deep subcategory filtering: Selected subcategories:`,
      subcategoryIds
    );

    // Validate subcategory IDs belong to the parent category
    const validSubcategoryIds = await validateSubcategoryIds(
      categoryId,
      subcategoryIds
    );

    if (validSubcategoryIds.length === 0) {
      console.log(
        `⚠️ No valid subcategories found, falling back to parent category deep filtering`
      );
      // Fall back to parent category + ALL descendants (deep filtering)
      categoryIdsToFilter = await getAllCategoryDescendants([categoryId]);
    } else {
      // Get all descendants of the selected subcategories (deep filtering)
      categoryIdsToFilter = await getAllCategoryDescendants(
        validSubcategoryIds
      );
    }

    console.log(
      `🔍 Deep subcategory filtering: Including ${categoryIdsToFilter.length} categories (original: ${subcategoryIds.length})`
    );
  } else {
    // No subcategories selected, use parent category + ALL descendants (deep filtering)
    console.log(`🔍 Deep parent category filtering: ${categoryId}`);

    // Get ALL descendants of the parent category (deep filtering)
    categoryIdsToFilter = await getAllCategoryDescendants([categoryId]);

    console.log(
      `🔍 Deep parent category filtering: Including ${categoryIdsToFilter.length} categories`
    );
  }

  // Return filter that checks both main listing and individual services
  return {
    OR: [
      // Filter by main listing category
      { categoryId: { in: categoryIdsToFilter } },
      // Filter by individual services categories
      {
        services: {
          some: {
            categoryIds: { hasSome: categoryIdsToFilter },
          },
        },
      },
    ],
  };
};

/**
 * Build full category paths from an array of category IDs.
 * This function fetches the full hierarchy for each provided category ID.
 * Used to automatically generate categoryPaths from categoryIds for data consistency.
 */
export const buildCategoryPathsFromIds = async (
  categoryIds: string[]
): Promise<string[][]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  const categoryPaths: string[][] = [];

  for (const categoryId of categoryIds) {
    let currentCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, parentId: true },
    });

    if (!currentCategory) {
      console.log(`⚠️ Category not found: ${categoryId}, skipping`);
      continue;
    }

    const path: string[] = [];
    const visitedIds = new Set<string>(); // To prevent infinite loops in case of circular references

    while (currentCategory && !visitedIds.has(currentCategory.id)) {
      visitedIds.add(currentCategory.id);
      path.unshift(currentCategory.name); // Add to the beginning to build path from root
      if (currentCategory.parentId) {
        currentCategory = await prisma.category.findUnique({
          where: { id: currentCategory.parentId },
          select: { id: true, name: true, parentId: true },
        });
      } else {
        currentCategory = null; // Reached root
      }
    }
    if (path.length > 0) {
      categoryPaths.push(path);
    }
  }

  console.log(
    `🔧 Built ${categoryPaths.length} category paths from ${categoryIds.length} category IDs`
  );
  return categoryPaths;
};
