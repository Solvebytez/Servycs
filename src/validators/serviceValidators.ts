import { body, param, query } from "express-validator";

// Validation for creating a service listing
export const validateCreateServiceListing = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be between 5 and 1000 characters"),

  body("categoryId").isMongoId().withMessage("Valid category ID is required"),

  body("categoryPath")
    .isArray({ min: 1 })
    .withMessage("Category path must be an array with at least one element")
    .custom((value) => {
      if (
        !value.every(
          (item: any) => typeof item === "string" && item.trim().length > 0
        )
      ) {
        throw new Error("All category path elements must be non-empty strings");
      }
      return true;
    }),

  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required")
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)"
    ),

  body("whatsappNumber")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required")
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid Indian WhatsApp number (10 digits starting with 6, 7, 8, or 9)"
    ),

  body("image")
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty/null values
      // Allow both URLs and local file paths
      const isUrl = /^https?:\/\//.test(value);
      const isLocalFile = /^file:\/\//.test(value);
      if (!isUrl && !isLocalFile) {
        throw new Error("Image must be a valid URL or local file path");
      }
      return true;
    }),

  body("selectedAddressId")
    .isMongoId()
    .withMessage("Valid address ID is required"),

  body("services")
    .isArray({ min: 1 })
    .withMessage("At least one service is required")
    .custom((services) => {
      if (!Array.isArray(services)) {
        throw new Error("Services must be an array");
      }

      for (const service of services) {
        if (
          !service.name ||
          typeof service.name !== "string" ||
          service.name.trim().length === 0
        ) {
          throw new Error("Each service must have a valid name");
        }
        if (
          !service.description ||
          typeof service.description !== "string" ||
          service.description.trim().length === 0
        ) {
          throw new Error("Each service must have a valid description");
        }
        if (
          !service.price ||
          typeof service.price !== "number" ||
          service.price <= 0
        ) {
          throw new Error(
            "Each service must have a valid price greater than 0"
          );
        }
        if (
          service.discountPrice !== undefined &&
          (typeof service.discountPrice !== "number" ||
            service.discountPrice < 0)
        ) {
          throw new Error(
            "Discount price must be a number greater than or equal to 0"
          );
        }
      }
      return true;
    }),
];

// Validation for updating a service listing
export const validateUpdateServiceListing = [
  param("id").isMongoId().withMessage("Valid listing ID is required"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be between 5 and 1000 characters"),

  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Valid category ID is required"),

  body("categoryPath")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Category path must be an array with at least one element")
    .custom((value) => {
      if (
        !value.every(
          (item: any) => typeof item === "string" && item.trim().length > 0
        )
      ) {
        throw new Error("All category path elements must be non-empty strings");
      }
      return true;
    }),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)"
    ),

  body("whatsappNumber")
    .optional()
    .trim()
    .matches(/^(\+91|91)?[6-9]\d{9}$/)
    .withMessage(
      "Please enter a valid Indian WhatsApp number (10 digits starting with 6, 7, 8, or 9)"
    ),

  body("image")
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty/null values
      // Allow both URLs and local file paths
      const isUrl = /^https?:\/\//.test(value);
      const isLocalFile = /^file:\/\//.test(value);
      if (!isUrl && !isLocalFile) {
        throw new Error("Image must be a valid URL or local file path");
      }
      return true;
    }),

  body("selectedAddressId")
    .optional()
    .isMongoId()
    .withMessage("Valid address ID is required"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean value"),
];

// Validation for getting service listings with query parameters
export const validateGetServiceListings = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ObjectId"),

  query("vendorId")
    .optional()
    .isMongoId()
    .withMessage("Vendor ID must be a valid MongoDB ObjectId"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  query("city")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City must be between 1 and 100 characters"),

  query("state")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("State must be between 1 and 100 characters"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Validation for getting a single service listing
export const validateGetServiceListingById = [
  param("id").isMongoId().withMessage("Valid listing ID is required"),
];

// Validation for deleting a service listing
export const validateDeleteServiceListing = [
  param("id").isMongoId().withMessage("Valid listing ID is required"),
];
