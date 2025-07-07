const jwt = require('jsonwebtoken');

class JWTService {
  constructor() {
    this.secret =
      process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @param {string} user.id - User ID
   * @param {string} user.email - User email
   * @param {string} user.role - User role
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Decode token without verification (for logging purposes)
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date} Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JWTService();
