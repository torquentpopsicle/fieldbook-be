const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userService = require('../services/userService');

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve current user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - no token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await userService.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'Not Found',
      });
    }

    console.log('👤 PROFILE REQUEST:', {
      email: user.email,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('❌ PROFILE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

module.exports = router;
