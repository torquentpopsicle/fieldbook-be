/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('❌ ERROR HANDLER:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    userId: req.user?.userId || 'anonymous',
    userEmail: req.user?.email || 'anonymous',
  });

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      message: 'Database connection error. Please try again later.',
      error: 'Service Unavailable',
      timestamp: new Date().toISOString(),
    });
  }

  // PostgreSQL specific errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      message: 'Resource already exists',
      error: 'Conflict',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === '23503') {
    // Foreign key constraint violation
    return res.status(400).json({
      message: 'Invalid reference. The referenced resource does not exist.',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === '23502') {
    // Not null constraint violation
    return res.status(400).json({
      message: 'Missing required fields',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      error: 'Bad Request',
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom business logic errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.error || 'Error',
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for business logic errors
 */
class AppError extends Error {
  constructor(message, statusCode, error = 'Error') {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  console.log('❌ ROUTE NOT FOUND:', {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    message: 'Endpoint not found',
    error: 'Not Found',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFoundHandler,
};
