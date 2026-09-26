const express = require('express');
const router = express.Router();
const sharedExpenseController = require('../controllers/sharedExpenseController');
const { authenticate } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const {
  createSharedExpenseValidator,
  settleParticipantValidator,
  deleteSharedExpenseValidator,
  sendReminderValidator
} = require('../validators/sharedExpenseValidator');

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

// Get all shared expenses
router.get('/', authenticate, sharedExpenseController.getSharedExpenses);

// Get shared expense by ID
router.get('/:id', authenticate, sharedExpenseController.getSharedExpenseById);

// Create shared expense
router.post('/', authenticate, createSharedExpenseValidator, validate, sharedExpenseController.createSharedExpense);

// Settle participant
router.patch('/:id/participants/:participantId/settle', authenticate, settleParticipantValidator, validate, sharedExpenseController.settleParticipant);

// Send reminder
router.post('/:id/remind', authenticate, sendReminderValidator, validate, sharedExpenseController.sendReminder);

// Delete shared expense
router.delete('/:id', authenticate, deleteSharedExpenseValidator, validate, sharedExpenseController.deleteSharedExpense);

module.exports = router;
