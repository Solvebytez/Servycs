import { body, param, query } from "express-validator";

// Validation for creating a category
export const createCategoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-&]+$/)
    .withMessage(
      "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("parentId")
    .optional()
    .isMongoId()
    .withMessage("Parent ID must be a valid MongoDB ObjectId"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage("Sort order must be an integer between 0 and 9999"),
];

// Validation for updating a category
export const updateCategoryValidation = [
  param("id")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-&]+$/)
    .withMessage(
      "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("parentId")
    .optional()
    .isMongoId()
    .withMessage("Parent ID must be a valid MongoDB ObjectId"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage("Sort order must be an integer between 0 and 9999"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Validation for getting category by ID
export const getCategoryByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),
];

// Validation for getting category children
export const getCategoryChildrenValidation = [
  param("id")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),
];

// Validation for checking if category has children
export const checkCategoryHasChildrenValidation = [
  param("id")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),
];

// Validation for deleting a category
export const deleteCategoryValidation = [
  param("id")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),
];

// Validation for getting category tree (admin only)
export const getCategoryTreeValidation = [
  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive must be a boolean value"),

  query("maxDepth")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("maxDepth must be an integer between 1 and 10"),
];
