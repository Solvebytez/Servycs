import { body, param, query } from 'express-validator';

export const createServiceValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Service title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Service description must be between 20 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number')
    .custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error('Discount price must be less than regular price');
      }
      return true;
    }),
  body('category')
    .isIn([
      'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
      'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
      'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
      'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
    ])
    .withMessage('Invalid service category'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters')
];

export const updateServiceValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Service title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Service description must be between 20 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
  body('category')
    .optional()
    .isIn([
      'HEALTH_CARE', 'FITNESS', 'TRAVEL', 'LOANS', 'DOCTORS', 'BEAUTY',
      'GYMS', 'REPAIRS_SERVICES', 'RETAIL', 'PROFESSIONAL_SERVICES',
      'RESTAURANTS', 'HOTEL_SERVICE', 'TECH_SERVICE', 'CAFE_SNACKS',
      'WEAR_ACC', 'CAR_SERVICE', 'SPA_CENTER'
    ])
    .withMessage('Invalid service category'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

export const getServiceByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid service ID format')
];

export const searchServicesValidation = [
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
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['price', 'rating', 'views', 'createdAt', 'name'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
