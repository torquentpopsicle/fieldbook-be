const jwtService = require('../services/jwtService');

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token required',
      error: 'Unauthorized',
    });
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token',
      error: 'Forbidden',
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwtService.verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }
  }

  next();
};

/**
 * Role-based authorization middleware
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Middleware function
 */
const authorizeRoles = roles => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'Unauthorized',
      });
    }

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        error: 'Forbidden',
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
};
