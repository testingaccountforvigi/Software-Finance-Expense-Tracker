const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  approveTransactionValidator,
  rejectTransactionValidator,
  simulateTransactionsValidator,
  parseReceiptValidator,
  getTransactionsValidator
} = require('../validators/transactionValidator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all transactions
router.get('/', authenticate, getTransactionsValidator, validate, transactionController.getTransactions);

// Simulate transactions
router.post('/simulate', authenticate, simulateTransactionsValidator, validate, transactionController.simulateTransactions);

// Parse receipt
router.post('/parse', authenticate, parseReceiptValidator, validate, transactionController.parseReceipt);

// Approve transaction
router.post('/:id/approve', authenticate, approveTransactionValidator, validate, transactionController.approveTransaction);

// Reject transaction
router.post('/:id/reject', authenticate, rejectTransactionValidator, validate, transactionController.rejectTransaction);

// Check for duplicates
router.get('/:id/duplicates', authenticate, transactionController.checkDuplicates);

module.exports = router;
