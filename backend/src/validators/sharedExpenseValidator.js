const { body, param } = require('express-validator');

exports.createSharedExpenseValidator = [
  body('expense_id').notEmpty().withMessage('Expense ID is required').isUUID().withMessage('Invalid expense ID'),
  body('title').optional().isString().trim().isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
  body('split_method').notEmpty().withMessage('Split method is required').isIn(['EQUAL', 'MANUAL', 'PERCENTAGE', 'equal', 'manual', 'percentage', 'custom']).withMessage('Invalid split method'),
  body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('participants.*.email').optional().isEmail().withMessage('Invalid email address'),
  body('participants.*.user_id').optional().isUUID().withMessage('Invalid user ID'),
  body('participants.*.share_amount').optional().isFloat({ min: 0 }).withMessage('Share amount must be a positive number'),
  body('participants.*.share_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Share percentage must be between 0 and 100')
];

exports.settleParticipantValidator = [
  param('id').isUUID().withMessage('Invalid shared expense ID'),
  param('participantId').isUUID().withMessage('Invalid participant ID'),
  body('amount_paid').optional().isFloat({ min: 0 }).withMessage('Amount paid must be a positive number')
];

exports.deleteSharedExpenseValidator = [
  param('id').isUUID().withMessage('Invalid shared expense ID')
];

exports.sendReminderValidator = [
  param('id').isUUID().withMessage('Invalid shared expense ID')
];
