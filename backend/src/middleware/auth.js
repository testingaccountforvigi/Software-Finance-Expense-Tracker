const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const users = await query(
      'SELECT id, email, status FROM users WHERE id = ? AND status = ?',
      [decoded.userId, 'ACTIVE']
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or is inactive.',
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: users[0].email,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await query(
      'SELECT id, email FROM users WHERE id = ? AND status = ?',
      [decoded.userId, 'ACTIVE']
    );

    if (users.length > 0) {
      req.user = {
        id: decoded.userId,
        email: users[0].email,
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
