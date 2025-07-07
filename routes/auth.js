const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

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
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
      error: 'Bad Request'
    });
  }

  const user = dataService.findUserByEmail(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      message: 'Email atau password yang Anda masukkan salah.',
      error: 'Unauthorized'
    });
  }

  res.json({
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      access_token: 'dummy.jwt.token'
    }
  });
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
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields required.' 
    });
  }

  // Check if email already exists
  if (dataService.emailExists(email)) {
    return res.status(409).json({
      message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      error: 'Conflict'
    });
  }

  // Add new user
  const newUser = dataService.addUser({ name, email, password });
  
  if (!newUser) {
    return res.status(500).json({
      message: 'Error creating user',
      error: 'Internal Server Error'
    });
  }

  res.status(201).json({
    message: 'User registered successfully',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

module.exports = router; 