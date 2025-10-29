import { body, param, query } from "express-validator";

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  // Note: Email validation but NOT allowed to update in controller
  body("phone")
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field

      // Remove all non-digit characters except +
      const cleanValue = value.replace(/[^\d+]/g, "");

      // Check if it's a valid Indian phone number
      // Pattern 1: 10 digits starting with 6,7,8,9 (e.g., 9876543210)
      // Pattern 2: +91 followed by 10 digits starting with 6,7,8,9 (e.g., +919876543210)
      const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;

      if (!indianPhoneRegex.test(cleanValue)) {
        throw new Error("Please enter a valid Indian phone number");
      }

      return true;
    }),
  body("businessAddresses")
    .optional()
    .isArray()
    .withMessage("Business addresses must be an array"),
  body("businessAddresses.*.name")
    .optional()
    .trim()
    .custom((value, { req }) => {
      // Only validate if businessAddresses array exists and has items
      if (
        req.body.businessAddresses &&
        Array.isArray(req.body.businessAddresses) &&
        req.body.businessAddresses.length > 0
      ) {
        if (!value || value.trim().length === 0) {
          throw new Error("Address type is required");
        }
        if (value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("Address type must be between 2 and 50 characters");
        }
      }
      return true;
    }),
  body("businessAddresses.*.address")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),
  body("businessAddresses.*.city")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("City must be between 1 and 100 characters"),
  body("businessAddresses.*.state")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("State must be between 1 and 100 characters"),
  body("businessAddresses.*.zipCode")
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Optional field
      // Indian zip codes are 6 digits, starting with 1-9
      const zipCodeRegex = /^[1-9][0-9]{5}$/;
      if (!zipCodeRegex.test(value)) {
        throw new Error("Please enter a valid Indian zip code (6 digits)");
      }
      return true;
    }),
  body("businessAddresses.*.country")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Country must be between 1 and 100 characters"),
];

export const getUserByIdValidation = [
  param("id").isUUID().withMessage("Invalid user ID format"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
];

export const changeEmailValidation = [
  body("newEmail")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Current password is required for email change"),
];

export const verifyEmailChangeValidation = [
  body("newEmail")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("otpCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits")
    .isNumeric()
    .withMessage("OTP code must contain only numbers"),
];

export const searchUsersValidation = [
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search query must be between 1 and 50 characters"),
  query("role")
    .optional()
    .isIn(["USER", "VENDOR", "SALESMAN", "ADMIN"])
    .withMessage("Invalid role"),
  query("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"])
    .withMessage("Invalid status"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
