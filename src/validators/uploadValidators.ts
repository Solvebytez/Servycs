import { body, query } from 'express-validator';

export const uploadSingleValidation = [
  body('folder')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Folder name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Folder name can only contain letters, numbers, hyphens, and underscores')
];

export const uploadMultipleValidation = [
  body('folder')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Folder name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Folder name can only contain letters, numbers, hyphens, and underscores')
];

export const deleteFileValidation = [
  body('publicId')
    .trim()
    .notEmpty()
    .withMessage('Public ID is required for file deletion'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL')
];
