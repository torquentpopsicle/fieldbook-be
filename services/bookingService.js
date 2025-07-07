const pool = require('./db');

class BookingService {
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.field_id - Field ID
   * @param {string} bookingData.user_id - User ID
   * @param {string} bookingData.start_time - Start time (HH:MM)
   * @param {string} bookingData.end_time - End time (HH:MM)
   * @param {string} bookingData.date - Booking date (YYYY-MM-DD)
   * @param {number} bookingData.total_price - Total price
   * @returns {Promise<Object>} Created booking object
   */
  async createBooking(bookingData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Generate booking ID
      const bookingId = this.generateBookingId();

      // Check if field exists and is active
      const fieldResult = await client.query(
        'SELECT id, price_per_hour FROM fields WHERE id = $1 AND is_active = true',
        [bookingData.field_id]
      );

      if (fieldResult.rows.length === 0) {
        throw new Error('Field not found or inactive');
      }

      // Check for booking conflicts
      const conflictResult = await client.query(
        `
        SELECT id FROM bookings 
        WHERE field_id = $1 
        AND booking_date = $2 
        AND status NOT IN ('cancelled', 'expired')
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
      `,
        [
          bookingData.field_id,
          bookingData.date,
          bookingData.start_time,
          bookingData.end_time,
        ]
      );

      if (conflictResult.rows.length > 0) {
        throw new Error('Booking time slot is not available');
      }

      // Create booking
      const bookingResult = await client.query(
        `
        INSERT INTO bookings (
          id, field_id, user_id, start_time, end_time, booking_date,
          total_price, status, payment_status, payment_due
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
        [
          bookingId,
          bookingData.field_id,
          bookingData.user_id,
          bookingData.start_time,
          bookingData.end_time,
          bookingData.date,
          bookingData.total_price,
          'pending_payment',
          'pending',
          new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        ]
      );

      const booking = bookingResult.rows[0];

      await client.query('COMMIT');

      console.log('✅ BOOKING CREATED:', {
        bookingId: booking.id,
        fieldId: booking.field_id,
        userId: booking.user_id,
        date: booking.booking_date,
        totalPrice: booking.total_price,
      });

      return booking;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ BOOKING CREATE ERROR:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all bookings with optional filtering
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {string} options.userId - Filter by user ID
   * @param {string} options.fieldId - Filter by field ID
   * @param {string} options.date - Filter by date
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @returns {Promise<Object>} Paginated bookings result
   */
  async getAllBookings(options = {}) {
    try {
      const { status, userId, fieldId, date, page = 1, limit = 10 } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let values = [];
      let valueIndex = 1;

      // Build WHERE clause
      if (status) {
        whereConditions.push(`b.status = $${valueIndex}`);
        values.push(status);
        valueIndex++;
      }

      if (userId) {
        whereConditions.push(`b.user_id = $${valueIndex}`);
        values.push(userId);
        valueIndex++;
      }

      if (fieldId) {
        whereConditions.push(`b.field_id = $${valueIndex}`);
        values.push(fieldId);
        valueIndex++;
      }

      if (date) {
        whereConditions.push(`b.booking_date = $${valueIndex}`);
        values.push(date);
        valueIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM bookings b
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, values);
      const totalBookings = parseInt(countResult.rows[0].count);

      // Get bookings with pagination
      const bookingsQuery = `
        SELECT 
          b.*,
          f.name as field_name,
          f.location_summary as field_location,
          u.name as user_name,
          u.email as user_email
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN users u ON b.user_id = u.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;

      const bookingsResult = await pool.query(bookingsQuery, [
        ...values,
        limit,
        offset,
      ]);

      console.log('✅ BOOKINGS QUERY:', {
        totalBookings,
        returnedBookings: bookingsResult.rows.length,
        filters: { status, userId, fieldId, date },
        page,
        limit,
      });

      return {
        data: bookingsResult.rows,
        pagination: {
          total_results: totalBookings,
          current_page: page,
          total_pages: Math.ceil(totalBookings / limit),
          limit: limit,
        },
      };
    } catch (error) {
      console.error('❌ BOOKINGS QUERY ERROR:', error);
      throw new Error('Failed to retrieve bookings');
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object|null>} Booking object or null
   */
  async getBookingById(bookingId) {
    try {
      const query = `
        SELECT 
          b.*,
          f.name as field_name,
          f.location_summary as field_location,
          f.address as field_address,
          u.name as user_name,
          u.email as user_email
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = $1
      `;

      const result = await pool.query(query, [bookingId]);

      if (result.rows.length === 0) {
        return null;
      }

      const booking = result.rows[0];

      // Get payment information
      const paymentQuery = `
        SELECT * FROM booking_payments
        WHERE booking_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const paymentResult = await pool.query(paymentQuery, [bookingId]);
      booking.payment = paymentResult.rows[0] || null;

      console.log('✅ BOOKING DETAILS QUERY:', {
        bookingId,
        fieldName: booking.field_name,
        userName: booking.user_name,
        status: booking.status,
      });

      return booking;
    } catch (error) {
      console.error('❌ BOOKING DETAILS QUERY ERROR:', error);
      throw new Error('Failed to retrieve booking details');
    }
  }

  /**
   * Update a booking
   * @param {number} bookingId - Booking ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated booking object or null
   */
  async updateBooking(bookingId, updateData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if booking exists
      const existingBooking = await client.query(
        'SELECT id FROM bookings WHERE id = $1',
        [bookingId]
      );

      if (existingBooking.rows.length === 0) {
        return null;
      }

      // Update booking
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      Object.keys(updateData).forEach(key => {
        updateFields.push(`${key} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      });

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE bookings 
          SET ${updateFields.join(', ')}
          WHERE id = $${valueIndex}
          RETURNING *
        `;

        const result = await client.query(updateQuery, [...values, bookingId]);
        const booking = result.rows[0];

        await client.query('COMMIT');

        console.log('✅ BOOKING UPDATED:', {
          bookingId,
          updatedFields: Object.keys(updateData),
        });

        return booking;
      }

      await client.query('COMMIT');
      return null;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ BOOKING UPDATE ERROR:', error);
      throw new Error('Failed to update booking');
    } finally {
      client.release();
    }
  }

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @param {string} cancelledBy - User ID who cancelled
   * @returns {Promise<boolean>} Success status
   */
  async cancelBooking(bookingId, reason = null, cancelledBy = null) {
    try {
      const result = await pool.query(
        `
        UPDATE bookings 
        SET status = 'cancelled', 
            cancellation_reason = $1, 
            cancelled_by = $2, 
            cancelled_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND status IN ('pending', 'confirmed')
        RETURNING id
      `,
        [reason, cancelledBy, bookingId]
      );

      const cancelled = result.rows.length > 0;

      if (cancelled) {
        console.log('✅ BOOKING CANCELLED:', { bookingId, reason });
      } else {
        console.log('⚠️ BOOKING NOT FOUND OR ALREADY CANCELLED:', {
          bookingId,
        });
      }

      return cancelled;
    } catch (error) {
      console.error('❌ BOOKING CANCEL ERROR:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  /**
   * Get booking statistics
   * @param {Object} options - Query options
   * @param {string} options.userId - Filter by user ID
   * @param {string} options.fieldId - Filter by field ID
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStatistics(options = {}) {
    try {
      const { userId, fieldId } = options;
      let whereConditions = [];
      let values = [];
      let valueIndex = 1;

      if (userId) {
        whereConditions.push(`user_id = $${valueIndex}`);
        values.push(userId);
        valueIndex++;
      }

      if (fieldId) {
        whereConditions.push(`field_id = $${valueIndex}`);
        values.push(fieldId);
        valueIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      const statsQuery = `
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COUNT(CASE WHEN status = 'pending_payment' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
          SUM(total_price) as total_revenue,
          AVG(total_price) as average_booking_value
        FROM bookings
        ${whereClause}
      `;

      const result = await pool.query(statsQuery, values);
      const stats = result.rows[0];

      console.log('✅ BOOKING STATISTICS QUERY:', {
        totalBookings: stats.total_bookings,
        totalRevenue: stats.total_revenue,
        filters: { userId, fieldId },
      });

      return stats;
    } catch (error) {
      console.error('❌ BOOKING STATISTICS QUERY ERROR:', error);
      throw new Error('Failed to retrieve booking statistics');
    }
  }

  /**
   * Generate booking ID
   * @returns {string} Generated booking ID
   */
  generateBookingId() {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `BK-${dateStr}-${randomStr}`;
  }
}

module.exports = new BookingService();
