const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const jwtService = require('../services/jwtService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ LOGIN FAILED: Missing email or password');
      return res.status(400).json({
        message: 'Email and password are required',
        error: 'Bad Request',
      });
    }

    const user = await userService.findUserByEmail(email);

    if (!user || user.password !== password) {
      console.log('❌ LOGIN FAILED: Invalid credentials for email:', email);
      return res.status(401).json({
        message: 'Email atau password yang Anda masukkan salah.',
        error: 'Unauthorized',
      });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role || 'customer',
      name: user.name,
    };
    const tokenPair = jwtService.generateTokenPair(userPayload);

    console.log('✅ LOGIN SUCCESS:', {
      email,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', {
      email,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      console.log('❌ REGISTER FAILED: Missing required fields');
      return res.status(400).json({
        message: 'All fields required.',
      });
    }

    // Check if email already exists
    const emailExists = await userService.emailExists(email);
    if (emailExists) {
      console.log('❌ REGISTER FAILED: Email already exists:', email);
      return res.status(409).json({
        message: 'Email sudah terdaftar. Silakan gunakan email lain.',
        error: 'Conflict',
      });
    }

    // Create new user
    const newUser = await userService.createUser({ name, email, password });

    // Generate token pair for new user
    const tokenPair = jwtService.generateTokenPair(newUser);

    console.log('✅ REGISTER SUCCESS:', {
      email,
      userId: newUser.id,
      userName: newUser.name,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('❌ REGISTER ERROR:', {
      email,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: 'Error creating user',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token received during login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: New access token
 *                     refresh_token:
 *                       type: string
 *                       description: New refresh token
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: string
 *                       example: "24h"
 *                     refresh_expires_in:
 *                       type: string
 *                       example: "7d"
 *       400:
 *         description: Bad request - missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      console.log('❌ REFRESH FAILED: Missing refresh token');
      return res.status(400).json({
        message: 'Refresh token is required',
        error: 'Bad Request',
      });
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refresh_token);

    // Get user from database
    const user = await userService.findUserById(decoded.userId);

    if (!user) {
      console.log(
        '❌ REFRESH FAILED: User not found for userId:',
        decoded.userId
      );
      return res.status(401).json({
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      });
    }

    // Generate new token pair
    const tokenPair = jwtService.generateTokenPair(user);

    console.log('✅ REFRESH SUCCESS:', {
      email: user.email,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Token refreshed successfully',
      data: {
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
        refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    });
  } catch (error) {
    console.error('❌ REFRESH ERROR:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    if (error.message === 'Invalid refresh token') {
      return res.status(401).json({
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate token (client-side token removal)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - no token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticateToken, (req, res) => {
  const { userId, email } = req.user;

  console.log('✅ LOGOUT SUCCESS:', {
    email,
    userId,
    timestamp: new Date().toISOString(),
  });

  res.json({
    message: 'Logout successful',
    data: {
      message: 'Token should be removed from client storage',
    },
  });
});

module.exports = router;
