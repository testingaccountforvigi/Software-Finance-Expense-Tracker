const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { createExpenseValidator, updateExpenseValidator } = require('../validators/expenseValidator');

router.get('/', authenticate, expenseController.getExpenses);
router.get('/:id', authenticate, expenseController.getExpenseById);
router.post('/', authenticate, createExpenseValidator, expenseController.createExpense);
router.put('/:id', authenticate, updateExpenseValidator, expenseController.updateExpense);
router.delete('/:id', authenticate, expenseController.deleteExpense);

module.exports = router;
