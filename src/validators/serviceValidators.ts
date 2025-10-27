import { body, param, query } from "express-validator";

// Validation for creating a service listing with progressive validation based on currentStep
export const validateCreateServiceListing = [
  // Step 1 validations (always required)
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

  // Progressive validation based on currentStep
  body().custom((value, { req }) => {
    const currentStep = req.body.currentStep || 1;
    const status = req.body.status || "DRAFT";

    // For DRAFT status, validate based on currentStep
    if (status === "DRAFT") {
      if (currentStep >= 2) {
        // Step 2+ validations
        if (!req.body.selectedAddressId) {
          throw new Error("Valid address ID is required for step 2+");
        }
        if (!/^[0-9a-fA-F]{24}$/.test(req.body.selectedAddressId)) {
          throw new Error("Valid address ID is required for step 2+");
        }
      }

      if (currentStep >= 3) {
        // Step 3+ validations
        if (
          !req.body.services ||
          !Array.isArray(req.body.services) ||
          req.body.services.length === 0
        ) {
          throw new Error("At least one service is required for step 3+");
        }

        for (const service of req.body.services) {
          if (
            !service.name ||
            typeof service.name !== "string" ||
            service.name.trim().length === 0
          ) {
            throw new Error("Each service must have a valid name for step 3+");
          }
          if (
            !service.description ||
            typeof service.description !== "string" ||
            service.description.trim().length === 0
          ) {
            throw new Error(
              "Each service must have a valid description for step 3+"
            );
          }
          // Price validation (optional)
          if (service.price !== undefined && service.price !== null) {
            if (typeof service.price !== "number" || service.price <= 0) {
              throw new Error(
                "Service price must be a valid number greater than 0 if provided"
              );
            }
          }

          // Duration validation (optional)
          if (service.duration !== undefined && service.duration !== null) {
            if (
              typeof service.duration !== "string" ||
              service.duration.trim().length === 0
            ) {
              throw new Error(
                "Service duration must be a valid string if provided"
              );
            }
          }
          if (!service.categoryId) {
            throw new Error(
              "Each service must have a valid category for step 3+"
            );
          }
        }
      }
    } else if (status === "PENDING") {
      // For PENDING status, validate all fields
      if (!req.body.selectedAddressId) {
        throw new Error("Valid address ID is required");
      }
      if (!/^[0-9a-fA-F]{24}$/.test(req.body.selectedAddressId)) {
        throw new Error("Valid address ID is required");
      }
      if (
        !req.body.services ||
        !Array.isArray(req.body.services) ||
        req.body.services.length === 0
      ) {
        throw new Error("At least one service is required");
      }

      for (const service of req.body.services) {
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
        // Price validation (optional)
        if (service.price !== undefined && service.price !== null) {
          if (typeof service.price !== "number" || service.price <= 0) {
            throw new Error(
              "Service price must be a valid number greater than 0 if provided"
            );
          }
        }

        // Duration validation (optional)
        if (service.duration !== undefined && service.duration !== null) {
          if (
            typeof service.duration !== "string" ||
            service.duration.trim().length === 0
          ) {
            throw new Error(
              "Service duration must be a valid string if provided"
            );
          }
        }
        if (!service.categoryId) {
          throw new Error("Each service must have a valid category");
        }
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

  // New filter parameter validations
  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Minimum rating must be between 0 and 5"),

  query("businessHours")
    .optional()
    .isIn(["open-now", "24-7", "weekdays"])
    .withMessage("Business hours must be one of: open-now, 24-7, weekdays"),

  query("features")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(
          (item) => typeof item === "string" && item.trim().length > 0
        );
      }
      return typeof value === "string" && value.trim().length > 0;
    })
    .withMessage("Features must be a string or array of non-empty strings"),

  query("sortBy")
    .optional()
    .isIn([
      "createdAt",
      "updatedAt",
      "title",
      "rating",
      "averageRating",
      "price",
    ])
    .withMessage(
      "Sort by must be one of: createdAt, updatedAt, title, rating, averageRating, price"
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either 'asc' or 'desc'"),

  query("excludeUserId")
    .optional()
    .isMongoId()
    .withMessage("Exclude user ID must be a valid MongoDB ObjectId"),
];

// Validation for getting a single service listing
export const validateGetServiceListingById = [
  param("id").isMongoId().withMessage("Valid listing ID is required"),
];

// Validation for deleting a service listing
export const validateDeleteServiceListing = [
  param("id").isMongoId().withMessage("Valid listing ID is required"),
];
