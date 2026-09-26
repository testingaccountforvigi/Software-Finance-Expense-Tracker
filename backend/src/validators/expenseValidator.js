const { body, query } = require('express-validator');

const createExpenseValidator = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('merchant')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Merchant name is required and must not exceed 255 characters'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required'),
  body('expenseDate')
    .isDate()
    .withMessage('Invalid expense date'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
];

const updateExpenseValidator = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('merchant')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Merchant name is required'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required'),
  body('expenseDate')
    .isDate()
    .withMessage('Invalid expense date'),
];

module.exports = {
  createExpenseValidator,
  updateExpenseValidator,
};
