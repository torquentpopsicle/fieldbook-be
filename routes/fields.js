const express = require('express');
const router = express.Router();
const fieldService = require('../services/fieldService');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/fields:
 *   get:
 *     summary: Get all fields with pagination
 *     description: Retrieve a list of all available sports fields with pagination information
 *     tags: [Fields]
 *     responses:
 *       200:
 *         description: List of fields retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total_results:
 *                       type: integer
 *                       example: 6
 *                     current_page:
 *                       type: integer
 *                       example: 1
 *                     total_pages:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 6
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
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page,
      limit,
      sport_type,
      location,
      min_price,
      max_price,
      facility,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sportType: sport_type,
      location,
      minPrice: min_price ? parseFloat(min_price) : null,
      maxPrice: max_price ? parseFloat(max_price) : null,
      facility,
    };

    const result = await fieldService.getAllFields(options);

    res.json(result);
  } catch (error) {
    console.error('❌ FIELDS ROUTE ERROR:', error);
    res.status(500).json({
      message: 'Error retrieving fields',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/fields/{field_id}:
 *   get:
 *     summary: Get field details by ID
 *     description: Retrieve detailed information about a specific sports field
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: field_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The field ID
 *         example: 101
 *     responses:
 *       200:
 *         description: Field details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       404:
 *         description: Field not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:field_id', optionalAuth, async (req, res) => {
  try {
    const { field_id } = req.params;
    const fieldDetails = await fieldService.getFieldById(field_id);

    if (!fieldDetails) {
      return res.status(404).json({
        message: 'Field not found',
        error: 'Not Found',
      });
    }

    res.json({
      data: fieldDetails,
    });
  } catch (error) {
    console.error('❌ FIELD DETAILS ROUTE ERROR:', error);
    res.status(500).json({
      message: 'Error retrieving field details',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/fields/filters:
 *   get:
 *     summary: Get filter options
 *     description: Retrieve available filter options for fields including price range, features, and sport types
 *     tags: [Fields]
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     price_range:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                           example: 0
 *                         max:
 *                           type: integer
 *                           example: 500
 *                     features:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "indoor"
 *                           name:
 *                             type: string
 *                             example: "Indoor"
 *                     sport_types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Soccer"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/filters', async (req, res) => {
  try {
    const filtersData = await fieldService.getFilterOptions();
    res.json({ data: filtersData });
  } catch (error) {
    console.error('❌ FILTERS ROUTE ERROR:', error);
    res.status(500).json({
      message: 'Error loading filters data',
      error: 'Internal Server Error',
    });
  }
});

module.exports = router;
