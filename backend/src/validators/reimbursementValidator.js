const { body, param, query } = require('express-validator');

exports.createReimbursementValidator = [
  body('expense_id').optional().isUUID().withMessage('Invalid expense ID'),
  body('title').optional().isString().trim().isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
  body('description').notEmpty().withMessage('Description is required').isString().trim().isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
];

exports.updateReimbursementValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID'),
  body('title').optional().isString().trim().isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
  body('description').optional().isString().trim().isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
];

exports.submitReimbursementValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID')
];

exports.approveReimbursementValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID'),
  body('reviewer_notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Reviewer notes must be 1000 characters or less')
];

exports.rejectReimbursementValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID'),
  body('rejection_reason').notEmpty().withMessage('Rejection reason is required').isString().trim().isLength({ max: 1000 }).withMessage('Rejection reason must be 1000 characters or less')
];

exports.addDocumentValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID'),
  body('document_type').optional().isIn(['receipt', 'invoice', 'approval', 'other']).withMessage('Invalid document type'),
  body('file_name').notEmpty().withMessage('File name is required').isString().trim(),
  body('file_url').notEmpty().withMessage('File URL is required').isURL().withMessage('Invalid file URL'),
  body('file_size').optional().isInt({ min: 0 }).withMessage('File size must be a positive number')
];

exports.removeDocumentValidator = [
  param('id').isUUID().withMessage('Invalid reimbursement ID'),
  param('documentId').isUUID().withMessage('Invalid document ID')
];

exports.getReimbursementsValidator = [
  query('status').optional().isIn(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']).withMessage('Invalid status'),
  query('start_date').optional().isISO8601().withMessage('Invalid start date'),
  query('end_date').optional().isISO8601().withMessage('Invalid end date')
];
