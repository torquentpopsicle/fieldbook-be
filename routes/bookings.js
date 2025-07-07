const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking for a sports field
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Field not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req, res) => {
  const { field_id, start_time, end_time, date } = req.body;

  // Validate required fields
  if (!field_id || !start_time || !end_time || !date) {
    return res.status(400).json({
      message: 'Missing required fields: field_id, start_time, end_time, date',
      error: 'Bad Request',
    });
  }

  // Calculate total price (dummy calculation)
  const fieldDetails = dataService.getFieldDetails(field_id);
  if (!fieldDetails) {
    return res.status(404).json({
      message: 'Field not found',
      error: 'Not Found',
    });
  }

  // Calculate hours difference
  const start = new Date(`2000-01-01T${start_time}`);
  const end = new Date(`2000-01-01T${end_time}`);
  const hoursDiff = (end - start) / (1000 * 60 * 60);

  const totalPrice = fieldDetails.price_per_hour * hoursDiff;

  const bookingResponse = dataService.createBookingResponse(totalPrice);

  res.status(201).json(bookingResponse);
});

module.exports = router;
