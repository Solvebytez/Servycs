import { body } from "express-validator";

// Create promotion validation
export const createPromotionValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("serviceListingIds")
    .isArray({ min: 1 })
    .withMessage("At least one service listing must be selected")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("Service listing IDs must be an array");
      }
      if (value.length === 0) {
        throw new Error("At least one service listing must be selected");
      }
      // Validate each ID is a string
      for (const id of value) {
        if (typeof id !== "string" || id.trim().length === 0) {
          throw new Error("All service listing IDs must be valid strings");
        }
      }
      return true;
    }),

  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),

  body("discountValue")
    .isFloat({ min: 0.01 })
    .withMessage("Discount value must be a positive number")
    .custom((value, { req }) => {
      const discountType = req.body.discountType;
      const numValue = parseFloat(value);

      if (discountType === "percentage") {
        if (numValue < 1 || numValue > 100) {
          throw new Error("Percentage discount must be between 1-100");
        }
      } else if (discountType === "fixed") {
        if (numValue < 1 || numValue > 10000) {
          throw new Error("Fixed discount must be between 1-10000");
        }
      }

      return true;
    }),

  body("originalPrice")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Original price must be a positive number")
    .custom((value, { req }) => {
      const discountType = req.body.discountType;
      const discountValue = parseFloat(req.body.discountValue);

      if (discountType === "fixed" && value) {
        const originalPrice = parseFloat(value);
        if (originalPrice <= discountValue) {
          throw new Error(
            "Original price must be greater than discount amount"
          );
        }
      }

      return true;
    }),

  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const startDate = new Date(value);
      const now = new Date();
      // Allow start date to be up to 24 hours in the past to account for time differences
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      if (startDate < oneDayAgo) {
        throw new Error("Start date cannot be more than 24 hours in the past");
      }

      return true;
    }),

  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),

  body("bannerImage")
    .optional()
    .custom((value) => {
      if (value && value.trim() !== "") {
        // Allow both HTTP/HTTPS URLs and local file paths
        const urlPattern = /^https?:\/\/.+/;
        const filePattern = /^file:\/\/.+/;

        if (!urlPattern.test(value) && !filePattern.test(value)) {
          throw new Error("Banner image must be a valid URL or file path");
        }
      }
      return true;
    }),
];

// Update promotion validation
export const updatePromotionValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("serviceListingIds")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one service listing must be selected")
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("Service listing IDs must be an array");
      }
      if (value.length === 0) {
        throw new Error("At least one service listing must be selected");
      }
      // Validate each ID is a string
      for (const id of value) {
        if (typeof id !== "string" || id.trim().length === 0) {
          throw new Error("All service listing IDs must be valid strings");
        }
      }
      return true;
    }),

  body("discountType")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),

  body("discountValue")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Discount value must be a positive number"),

  body("originalPrice")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Original price must be a positive number"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("bannerImage")
    .optional()
    .custom((value) => {
      if (value && value.trim() !== "") {
        // Allow both HTTP/HTTPS URLs and local file paths
        const urlPattern = /^https?:\/\/.+/;
        const filePattern = /^file:\/\/.+/;

        if (!urlPattern.test(value) && !filePattern.test(value)) {
          throw new Error("Banner image must be a valid URL or file path");
        }
      }
      return true;
    }),

  body("isPromotionOn")
    .optional()
    .isBoolean()
    .withMessage("isPromotionOn must be a boolean value"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "PENDING", "INACTIVE", "EXPIRED", "REJECTED"])
    .withMessage(
      "Status must be one of: ACTIVE, PENDING, INACTIVE, EXPIRED, REJECTED"
    ),
];
