const jwt = require('jsonwebtoken');

class JWTService {
  constructor() {
    this.secret =
      process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      'your-refresh-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
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
   * Generate refresh token for user
   * @param {Object} user - User object
   * @param {string} user.id - User ID
   * @param {string} user.email - User email
   * @returns {string} Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing access and refresh tokens
   */
  generateTokenPair(user) {
    return {
      accessToken: this.generateToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
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
   * Verify refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} Decoded refresh token payload
   */
  verifyRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret);

      // Ensure this is a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
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

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

module.exports = new JWTService();
