const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');
const fieldService = require('../services/fieldService');
const { authenticateToken } = require('../middleware/auth');

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
 *             $ref: '#/components/schemas/BookingCreate'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
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
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { field_id, start_time, end_time, date } = req.body;

    // Validate required fields
    if (!field_id || !start_time || !end_time || !date) {
      return res.status(400).json({
        message:
          'Missing required fields: field_id, start_time, end_time, date',
        error: 'Bad Request',
      });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format. Use YYYY-MM-DD',
        error: 'Bad Request',
      });
    }

    // Get field details and calculate price
    const fieldDetails = await fieldService.getFieldById(field_id);
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

    // Create booking
    const bookingData = {
      field_id: parseInt(field_id),
      user_id: req.user.userId,
      booking_date: date,
      start_time,
      end_time,
      total_price: totalPrice,
    };

    const booking = await bookingService.createBooking(bookingData);

    const paymentDue = new Date();
    paymentDue.setHours(paymentDue.getHours() + 1); // Payment due in 1 hour

    res.status(201).json({
      data: {
        booking_id: booking.id,
        status: booking.status,
        total_price: booking.total_price,
        payment_due: paymentDue.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ BOOKING CREATE ROUTE ERROR:', error);

    if (error.message === 'Field not found or inactive') {
      return res.status(404).json({
        message: 'Field not found or inactive',
        error: 'Not Found',
      });
    }

    if (error.message === 'Booking time slot is not available') {
      return res.status(409).json({
        message: 'Selected time slot is not available',
        error: 'Conflict',
      });
    }

    res.status(500).json({
      message: 'Error creating booking',
      error: 'Internal Server Error',
    });
  }
});

module.exports = router;
