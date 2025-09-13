import { body, param, query } from 'express-validator';

export const createBookingValidation = [
  body('serviceId')
    .isUUID()
    .withMessage('Invalid service ID format'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

export const updateBookingValidation = [
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date')
    .custom((value) => {
      if (value) {
        const scheduledDate = new Date(value);
        const now = new Date();
        if (scheduledDate <= now) {
          throw new Error('Scheduled date must be in the future');
        }
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
    .withMessage('Invalid booking status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Cancellation reason must be between 10 and 200 characters')
];

export const getBookingByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID format')
];

export const cancelBookingValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Cancellation reason must be between 10 and 200 characters')
];

export const searchBookingsValidation = [
  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
    .withMessage('Invalid booking status'),
  query('serviceId')
    .optional()
    .isUUID()
    .withMessage('Invalid service ID format'),
  query('vendorId')
    .optional()
    .isUUID()
    .withMessage('Invalid vendor ID format'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('Invalid user ID format'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const createReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
];
