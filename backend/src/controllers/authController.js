const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password, full_name, age, professional_status, organization, role, currency } = req.body;

    // Check if user already exists
    const [existingUsers] = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile in transaction
    const result = await transaction(async (connection) => {
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password_hash, status, email_verified) VALUES (?, ?, ?, ?)',
        [email, passwordHash, 'ACTIVE', false]
      );

      const userId = userResult.insertId;

      // Get the generated UUID
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      const userUuid = userRows[0].id;

      // Insert user profile
      await connection.execute(
        `INSERT INTO user_profiles (user_id, full_name, age, professional_status, organization, role, currency, monthly_income)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userUuid, full_name, age || null, professional_status || null, organization || null, role || null, currency || 'INR', 0]
      );

      // Create default categories for user
      const defaultCategories = [
        ['Food & Dining', '#ef4444', 1],
        ['Transport', '#3b82f6', 2],
        ['Shopping', '#8b5cf6', 3],
        ['Bills & Utilities', '#f59e0b', 4],
        ['Entertainment', '#ec4899', 5],
        ['Health & Fitness', '#10b981', 6],
        ['Travel', '#06b6d4', 7],
        ['Education', '#6366f1', 8],
        ['Personal Care', '#a855f7', 9],
        ['Other', '#6b7280', 10],
      ];

      for (const [name, color, order] of defaultCategories) {
        await connection.execute(
          'INSERT INTO categories (user_id, name, color, active, display_order, is_default) VALUES (?, ?, ?, ?, ?, ?)',
          [userUuid, name, color, true, order, true]
        );
      }

      // Log audit event
      await connection.execute(
        `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userUuid, 'AUTH', 'REGISTER', 'USER', userUuid, 'SUCCESS', JSON.stringify({ email })]
      );

      return { userId: userUuid, email };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.userId, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user_id: result.userId,
        email: result.email,
        full_name: full_name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await query(
      'SELECT id, email, password_hash, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deleted',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Get user profile
    const [profiles] = await query(
      'SELECT full_name, age, professional_status, organization, role, currency, monthly_income FROM user_profiles WHERE user_id = ?',
      [user.id]
    );

    const profile = profiles[0] || {};

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user_id: user.id,
        email: user.email,
        full_name: profile.full_name,
        age: profile.age,
        professional_status: profile.professional_status,
        organization: profile.organization,
        role: profile.role,
        currency: profile.currency,
        monthly_income: profile.monthly_income,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
const me = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user and profile
    const [users] = await query(
      `SELECT u.id, u.email, u.status, u.email_verified, u.created_at,
              p.full_name, p.age, p.professional_status, p.organization, p.role, p.currency, p.monthly_income
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          age: user.age,
          professional_status: user.professional_status,
          organization: user.organization,
          role: user.role,
          currency: user.currency,
          monthly_income: user.monthly_income,
          email_verified: user.email_verified,
          status: user.status,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client-side token removal, optional server-side token blacklisting)
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Log logout event
    await query(
      `INSERT INTO audit_events (user_id, event_type, event_action, resource_type, resource_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'AUTH', 'LOGOUT', 'USER', userId, 'SUCCESS']
    );

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  logout,
};
