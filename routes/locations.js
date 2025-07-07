const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * @swagger
 * /api/v1/locations/autocomplete:
 *   get:
 *     summary: Get location autocomplete suggestions
 *     description: Retrieve location suggestions for autocomplete functionality
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Location suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Semarang"
 *                       id:
 *                         type: string
 *                         example: "kota-smg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/autocomplete', (req, res) => {
  const locationsData = dataService.getLocationsData();

  if (!locationsData) {
    return res.status(500).json({
      message: 'Error loading locations data',
      error: 'Internal Server Error',
    });
  }

  res.json(locationsData);
});

module.exports = router;
