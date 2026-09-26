const { query } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Get all categories for user
 */
const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { includeInactive = false } = req.query;

    let sql = `
      SELECT id, name, color, icon, active, display_order, is_default, created_at
      FROM categories
      WHERE user_id = ?
    `;

    if (!includeInactive || includeInactive === 'false') {
      sql += ' AND active = true';
    }

    sql += ' ORDER BY display_order ASC, name ASC';

    const [categories] = await query(sql, [userId]);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 */
const createCategory = async (req, res, next) => {
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
    const { name, color, icon } = req.body;

    // Check if category name already exists for user
    const [existing] = await query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?',
      [userId, name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    // Get max display_order
    const [maxOrderResult] = await query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM categories WHERE user_id = ?',
      [userId]
    );

    const nextOrder = maxOrderResult && maxOrderResult[0] ? maxOrderResult[0].next_order : 1;

    // Insert category
    await query(
      'INSERT INTO categories (user_id, name, color, icon, active, display_order, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, color || null, icon || null, true, nextOrder, false]
    );

    const [newCategoryResult] = await query(
      'SELECT id FROM categories WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const categoryId = newCategoryResult && newCategoryResult[0] ? newCategoryResult[0].id : null;

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id: categoryId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 */
const updateCategory = async (req, res, next) => {
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
    const { name, color, icon, active } = req.body;

    // Verify category belongs to user
    const [categories] = await query(
      'SELECT id, is_default FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if new name conflicts with existing category
    if (name) {
      const [existing] = await query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ? AND id != ?',
        [userId, name, id]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
    }

    // Update category
    await query(
      'UPDATE categories SET name = ?, color = ?, icon = ?, active = ? WHERE id = ? AND user_id = ?',
      [name, color, icon || null, active !== undefined ? active : true, id, userId]
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (deactivate) category
 */
const deleteCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify category belongs to user
    const [categories] = await query(
      'SELECT id, is_default FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category is used in expenses
    const [expenseCount] = await query(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ? AND user_id = ?',
      [id, userId]
    );

    if (expenseCount.count > 0) {
      // Deactivate instead of delete
      await query(
        'UPDATE categories SET active = false WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      return res.json({
        success: true,
        message: 'Category deactivated (has existing expenses)',
      });
    }

    // Delete if no expenses
    await query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder categories
 */
const reorderCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be an array',
      });
    }

    // Update each category's display_order
    for (const { id, order } of categoryOrders) {
      await query(
        'UPDATE categories SET display_order = ? WHERE id = ? AND user_id = ?',
        [order, id, userId]
      );
    }

    res.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
