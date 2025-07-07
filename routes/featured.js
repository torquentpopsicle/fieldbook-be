const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * @swagger
 * /api/v1/featured-fields:
 *   get:
 *     summary: Get featured fields
 *     description: Retrieve a list of featured/promoted sports fields
 *     tags: [Featured Fields]
 *     responses:
 *       200:
 *         description: Featured fields retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Field'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  const featuredData = dataService.getFeaturedFieldsData();
  
  if (!featuredData) {
    return res.status(500).json({
      message: 'Error loading featured fields data',
      error: 'Internal Server Error'
    });
  }

  res.json(featuredData);
});

module.exports = router; 