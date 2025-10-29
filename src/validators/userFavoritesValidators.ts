import { param, query } from "express-validator";

// Validation for MongoDB ObjectId
const isValidObjectId = (value: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(value);
};

// GET /users/:userId/favorites - Get user's favorite service listings
export const getUserFavoritesValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid user ID format");
      }
      return true;
    }),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

// POST /users/:userId/favorites/:serviceId - Add service to favorites
export const addToFavoritesValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid user ID format");
      }
      return true;
    }),

  param("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid service ID format");
      }
      return true;
    }),
];

// DELETE /users/:userId/favorites/:serviceId - Remove service from favorites
export const removeFromFavoritesValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid user ID format");
      }
      return true;
    }),

  param("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid service ID format");
      }
      return true;
    }),
];

// GET /users/:userId/favorites/:serviceId/status - Check if service is in favorites
export const checkFavoriteStatusValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid user ID format");
      }
      return true;
    }),

  param("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid service ID format");
      }
      return true;
    }),
];

// Export all validations
export default {
  getUserFavoritesValidation,
  addToFavoritesValidation,
  removeFromFavoritesValidation,
  checkFavoriteStatusValidation,
};
