const { query } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
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
    const { fullName, age, professionalStatus, organization, role, currency, monthlyIncome } = req.body;

    // Update profile
    await query(
      `UPDATE user_profiles 
       SET full_name = ?, age = ?, professional_status = ?, organization = ?, role = ?, currency = ?, monthly_income = ?
       WHERE user_id = ?`,
      [fullName, age, professionalStatus, organization, role, currency, monthlyIncome, userId]
    );

    // Log audit event
    await query(
      `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'PROFILE', 'UPDATE', 'USER_PROFILE', userId, 'SUCCESS']
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment methods
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [paymentMethods] = await query(
      `SELECT id, name, type, bank, last_four, is_default, active, created_at
       FROM payment_methods
       WHERE user_id = ? AND active = true
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getPaymentMethods,
};
