const { query } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Get all expenses with filters and pagination
 */
const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      sort = '-expense_date',
      categoryId,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
      source,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['e.user_id = ?'];
    let params = [userId];

    // Build WHERE conditions
    if (categoryId) {
      whereConditions.push('e.category_id = ?');
      params.push(categoryId);
    }

    if (startDate) {
      whereConditions.push('e.expense_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('e.expense_date <= ?');
      params.push(endDate);
    }

    if (search) {
      whereConditions.push('(e.merchant LIKE ? OR e.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minAmount) {
      whereConditions.push('e.amount >= ?');
      params.push(minAmount);
    }

    if (maxAmount) {
      whereConditions.push('e.amount <= ?');
      params.push(maxAmount);
    }

    if (source) {
      whereConditions.push('e.source = ?');
      params.push(source);
    }

    if (status) {
      whereConditions.push('e.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Determine sort order
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    const allowedSortFields = ['expense_date', 'amount', 'merchant', 'created_at'];
    const finalSortField = allowedSortFields.includes(sortField) ? sortField : 'expense_date';

    // Get total count
    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM expenses e WHERE ${whereClause}`,
      params
    );
    const total = countResult.total;

    // Get expenses
    const [expenses] = await query(
      `SELECT 
        e.id, e.amount, e.currency, e.merchant, e.description,
        e.expense_date, e.expense_time, e.source, e.status, e.receipt_url, e.notes, e.tags,
        e.created_at, e.updated_at,
        c.id as category_id, c.name as category_name, c.color as category_color,
        pm.id as payment_method_id, pm.name as payment_method_name, pm.type as payment_method_type
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
       WHERE ${whereClause}
       ORDER BY e.${finalSortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: expenses.map(exp => ({
        ...exp,
        tags: exp.tags ? JSON.parse(exp.tags) : []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single expense by ID
 */
const getExpenseById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [expenses] = await query(
      `SELECT 
        e.id, e.amount, e.currency, e.merchant, e.description,
        e.expense_date, e.expense_time, e.source, e.status, e.receipt_url, e.notes, e.tags,
        e.created_at, e.updated_at,
        c.id as category_id, c.name as category_name, c.color as category_color,
        pm.id as payment_method_id, pm.name as payment_method_name, pm.type as payment_method_type
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
       WHERE e.id = ? AND e.user_id = ?`,
      [id, userId]
    );

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const expense = expenses[0];
    expense.tags = expense.tags ? JSON.parse(expense.tags) : [];

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new expense
 */
const createExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      amount,
      currency = 'INR',
      merchant,
      description,
      categoryId,
      paymentMethodId,
      expenseDate,
      expenseTime,
      source = 'MANUAL',
      status = 'COMPLETED',
      receiptUrl,
      notes,
      tags
    } = req.body;

    // Verify category belongs to user
    const [categories] = await query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, userId]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    // Insert expense
    console.log('Expense data:', { userId, amount, currency, merchant, description, categoryId, paymentMethodId, expenseDate, expenseTime, source, status, receiptUrl, notes, tags });
    
    const [result] = await query(
      `INSERT INTO expenses (user_id, amount, currency, merchant, description, category_id, payment_method_id,
                            expense_date, expense_time, source, status, receipt_url, notes, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, amount, currency, merchant, description || null, categoryId, paymentMethodId || null,
       expenseDate, expenseTime || null, source, status, receiptUrl || null, notes || null,
       tags ? JSON.stringify(tags) : null]
    );

    // Get the created expense ID
    const [newExpense] = await query(
      'SELECT id FROM expenses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const expenseId = newExpense[0].id;

    // Log audit event (optional, skip if audit_events table has issues)
    try {
      await query(
        `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status, new_values)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'EXPENSE', 'CREATE', 'EXPENSE', expenseId, 'SUCCESS', JSON.stringify({ amount, merchant })]
      );
    } catch (auditError) {
      console.log('Audit logging failed (non-critical):', auditError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { id: expenseId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense
 */
const updateExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { id } = req.params;
    const {
      amount,
      currency,
      merchant,
      description,
      categoryId,
      paymentMethodId,
      expenseDate,
      expenseTime,
      status,
      receiptUrl,
      notes,
      tags
    } = req.body;

    // Verify expense belongs to user
    const [expenses] = await query(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Verify category belongs to user if provided
    if (categoryId) {
      const [categories] = await query(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [categoryId, userId]
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category',
        });
      }
    }

    // Update expense
    await query(
      `UPDATE expenses
       SET amount = ?, currency = ?, merchant = ?, description = ?, category_id = ?,
           payment_method_id = ?, expense_date = ?, expense_time = ?, status = ?,
           receipt_url = ?, notes = ?, tags = ?
       WHERE id = ? AND user_id = ?`,
      [amount, currency, merchant, description, categoryId, paymentMethodId || null,
       expenseDate, expenseTime || null, status, receiptUrl || null, notes || null,
       tags ? JSON.stringify(tags) : null, id, userId]
    );

    // Log audit event
    await query(
      `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'EXPENSE', 'UPDATE', 'EXPENSE', id, 'SUCCESS']
    );

    res.json({
      success: true,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify expense belongs to user
    const [expenses] = await query(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Delete expense (cascade will handle related records)
    await query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);

    // Log audit event
    await query(
      `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'EXPENSE', 'DELETE', 'EXPENSE', id, 'SUCCESS']
    );

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
