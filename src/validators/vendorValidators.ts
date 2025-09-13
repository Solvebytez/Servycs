import { body, param, query } from 'express-validator';

export const createVendorValidation = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid business email'),
  body('businessPhone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid business phone number'),
  body('businessAddress')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Business address must be between 10 and 200 characters'),
  body('businessCity')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business city must be between 2 and 50 characters'),
  body('businessState')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business state must be between 2 and 50 characters'),
  body('businessCountry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Business country must be between 2 and 50 characters'),
  body('businessDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Business description must not exceed 500 characters'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  body('categories.*')
    .isIn([
      'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
      'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
      'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
      'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
    ])
    .withMessage('Invalid category')
];

export const updateVendorValidation = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid business email'),
  body('businessPhone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid business phone number'),
  body('businessDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Business description must not exceed 500 characters'),
  body('categories')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  body('categories.*')
    .optional()
    .isIn([
      'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
      'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
      'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
      'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
    ])
    .withMessage('Invalid category')
];

export const getVendorByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid vendor ID format')
];

export const searchVendorsValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters'),
  query('category')
    .optional()
    .isIn([
      'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
      'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
      'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
      'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
    ])
    .withMessage('Invalid category'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
