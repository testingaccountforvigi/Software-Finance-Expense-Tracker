const { body, param, query } = require('express-validator');

exports.approveTransactionValidator = [
  param('id').isUUID().withMessage('Invalid transaction ID'),
  body('category_id').optional().isUUID().withMessage('Invalid category ID'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Notes must be 500 characters or less')
];

exports.rejectTransactionValidator = [
  param('id').isUUID().withMessage('Invalid transaction ID'),
  body('reason').optional().isString().trim().isLength({ max: 500 }).withMessage('Reason must be 500 characters or less')
];

exports.simulateTransactionsValidator = [
  body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50')
];

exports.parseReceiptValidator = [
  body('receipt_text').notEmpty().withMessage('Receipt text is required').isString().trim().isLength({ max: 10000 }).withMessage('Receipt text is too long')
];

exports.getTransactionsValidator = [
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];
