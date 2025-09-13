import { body, param, query } from 'express-validator';

export const updateUserStatusValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('status')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'VERIFIED'])
    .withMessage('Invalid user status'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters')
];

export const approveVendorValidation = [
  param('vendorId')
    .isUUID()
    .withMessage('Invalid vendor ID format'),
  body('approved')
    .isBoolean()
    .withMessage('Approved must be a boolean'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters')
];

export const manageSalesmanValidation = [
  body('targetVendors')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target vendors must be a positive integer'),
  body('targetUsers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target users must be a positive integer'),
  body('territory')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Territory must be between 2 and 100 characters')
];

export const createSupportTicketValidation = [
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level')
];

export const updateSupportTicketValidation = [
  param('ticketId')
    .isUUID()
    .withMessage('Invalid ticket ID format'),
  body('status')
    .optional()
    .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Invalid ticket status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Invalid admin ID format')
];

export const flagContentValidation = [
  body('contentType')
    .isIn(['REVIEW', 'LISTING', 'COMMENT'])
    .withMessage('Invalid content type'),
  body('contentId')
    .isUUID()
    .withMessage('Invalid content ID format'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Reason must be between 10 and 200 characters')
];

export const reviewFlaggedContentValidation = [
  param('flagId')
    .isUUID()
    .withMessage('Invalid flag ID format'),
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Status must be APPROVED or REJECTED'),
  body('reviewNotes')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Review notes must be between 10 and 500 characters')
];

export const updateSystemSettingValidation = [
  body('key')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Setting key must be between 2 and 50 characters')
    .matches(/^[A-Z_]+$/)
    .withMessage('Setting key must be uppercase letters and underscores only'),
  body('value')
    .trim()
    .notEmpty()
    .withMessage('Setting value is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
];

export const getAnalyticsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  query('metric')
    .optional()
    .isIn(['users', 'vendors', 'bookings', 'revenue', 'reviews'])
    .withMessage('Invalid metric type'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Invalid groupBy period')
];
