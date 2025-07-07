const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

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
router.get('/', (req, res) => {
  const fieldsData = dataService.getFieldsData();

  if (!fieldsData) {
    return res.status(500).json({
      message: 'Error loading fields data',
      error: 'Internal Server Error',
    });
  }

  res.json(fieldsData);
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
 *                   $ref: '#/components/schemas/FieldDetail'
 *       404:
 *         description: Field not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:field_id', (req, res) => {
  const { field_id } = req.params;
  const fieldDetails = dataService.getFieldDetails(field_id);

  if (!fieldDetails) {
    return res.status(404).json({
      message: 'Field not found',
      error: 'Not Found',
    });
  }

  res.json({
    data: fieldDetails,
  });
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
router.get('/filters', (req, res) => {
  const filtersData = dataService.getFiltersData();

  if (!filtersData) {
    return res.status(500).json({
      message: 'Error loading filters data',
      error: 'Internal Server Error',
    });
  }

  res.json(filtersData);
});

module.exports = router;
