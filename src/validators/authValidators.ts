import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Username must be between 5 and 30 characters")
    .matches(/^[a-z][a-z0-9_-]{4,29}$/)
    .withMessage(
      "Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens"
    ),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("role")
    .optional()
    .isIn(["USER", "VENDOR", "SALESMAN"])
    .withMessage("Invalid role"),
  body("createdBy")
    .optional()
    .isString()
    .withMessage("createdBy must be a string")
    .isLength({ min: 24, max: 24 })
    .withMessage("createdBy must be a valid ObjectId (24 characters)"),
];

export const loginValidation = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const verifyEmailValidation = [
  body("token").notEmpty().withMessage("Verification token is required"),
];

export const resendVerificationValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

export const tokenAuthValidation = [
  body("signInTokn")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("signInTokn must be a non-empty string"),
  body("signInToken")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("signInToken must be a non-empty string"),
  body("createdBy")
    .optional()
    .isString()
    .withMessage("createdBy must be a string")
    .isLength({ min: 24, max: 24 })
    .withMessage("createdBy must be a valid ObjectId (24 characters)"),
];

export const checkUsernameValidation = [
  body("username")
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Username must be between 5 and 30 characters")
    .matches(/^[a-z][a-z0-9_-]{4,29}$/)
    .withMessage(
      "Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens"
    ),
];

export const updateUsernameValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 5, max: 30 })
    .withMessage("Username must be between 5 and 30 characters")
    .matches(/^[a-z][a-z0-9_-]{4,29}$/)
    .withMessage(
      "Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens"
    ),
];
