import { body, param, query } from "express-validator";

// Validation for getting user's saved lists
export const validateGetUserSavedLists = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  query("includeItems")
    .optional()
    .isBoolean()
    .withMessage("includeItems must be a boolean"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("search")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
];

// Validation for creating a saved list
export const validateCreateSavedList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("List name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("List name must be between 1 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex color code (e.g., #FF5733)"),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name must not exceed 50 characters"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),
];

// Validation for getting a specific saved list
export const validateGetSavedListById = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),
];

// Validation for updating a saved list
export const validateUpdateSavedList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("List name cannot be empty")
    .isLength({ min: 1, max: 100 })
    .withMessage("List name must be between 1 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color must be a valid hex color code (e.g., #FF5733)"),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Icon name must not exceed 50 characters"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

// Validation for deleting a saved list
export const validateDeleteSavedList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),
];

// Validation for adding a service to a list
export const validateAddServiceToList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),

  body("serviceListingId")
    .isMongoId()
    .withMessage("Valid service listing ID is required"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

// Validation for removing a service from a list
export const validateRemoveServiceFromList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),

  param("itemId").isMongoId().withMessage("Valid item ID is required"),
];

// Validation for checking service list status
export const validateCheckServiceListStatus = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("serviceId").isMongoId().withMessage("Valid service ID is required"),
];

// Validation for bulk operations (add to multiple lists)
export const validateBulkAddToList = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  body("serviceListingId")
    .isMongoId()
    .withMessage("Valid service listing ID is required"),

  body("listIds")
    .isArray({ min: 1 })
    .withMessage("At least one list ID is required")
    .custom((listIds) => {
      if (
        !listIds.every(
          (id: any) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)
        )
      ) {
        throw new Error("All list IDs must be valid MongoDB ObjectIds");
      }
      return true;
    }),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

// Validation for reordering list items
export const validateReorderListItems = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),

  body("itemOrders")
    .isArray({ min: 1 })
    .withMessage("Item orders array is required")
    .custom((itemOrders) => {
      if (
        !itemOrders.every(
          (item: any) =>
            typeof item === "object" &&
            typeof item.itemId === "string" &&
            typeof item.sortOrder === "number" &&
            /^[0-9a-fA-F]{24}$/.test(item.itemId) &&
            item.sortOrder >= 0
        )
      ) {
        throw new Error(
          "Each item order must have valid itemId (MongoDB ObjectId) and sortOrder (non-negative number)"
        );
      }
      return true;
    }),
];

// Validation for updating list item notes
export const validateUpdateListItem = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  param("listId").isMongoId().withMessage("Valid list ID is required"),

  param("itemId").isMongoId().withMessage("Valid item ID is required"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];
