const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const userService = require('../services/userService');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Apply authentication and admin role requirement to all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// ============================
// FIELDS MANAGEMENT (CRUD)
// ============================

/**
 * @swagger
 * /api/v1/admin/fields:
 *   get:
 *     summary: Get all fields (Admin)
 *     description: Get all fields with admin-level details
 *     tags: [Admin - Fields]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fields retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fields retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Field'
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/fields', (req, res) => {
  try {
    const fieldsData = dataService.getFieldsData();

    if (!fieldsData) {
      return res.status(500).json({
        message: 'Error loading fields data',
        error: 'Internal Server Error',
      });
    }

    console.log('✅ ADMIN FIELDS LIST:', {
      adminEmail: req.user.email,
      fieldsCount: fieldsData.data.length,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Fields retrieved successfully',
      data: fieldsData.data,
    });
  } catch (error) {
    console.error('❌ ADMIN FIELDS LIST ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/fields:
 *   post:
 *     summary: Create a new field (Admin)
 *     description: Create a new sports field
 *     tags: [Admin - Fields]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location_summary
 *               - sport_type
 *               - capacity
 *               - price_per_hour
 *               - currency
 *               - key_facilities
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Futsal Arena"
 *               location_summary:
 *                 type: string
 *                 example: "Downtown, Jakarta"
 *               sport_type:
 *                 type: string
 *                 example: "Futsal"
 *               capacity:
 *                 type: integer
 *                 example: 10
 *               price_per_hour:
 *                 type: number
 *                 example: 100000
 *               currency:
 *                 type: string
 *                 example: "Rp"
 *               key_facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Indoor", "Parking", "Changing Rooms"]
 *               main_image_url:
 *                 type: string
 *                 example: "https://example.com/images/field.jpg"
 *               availability_summary:
 *                 type: string
 *                 example: "Available today"
 *     responses:
 *       201:
 *         description: Field created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Field created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       400:
 *         description: Bad request - missing required fields
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/fields', (req, res) => {
  try {
    const {
      name,
      location_summary,
      sport_type,
      capacity,
      price_per_hour,
      currency,
      key_facilities,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !location_summary ||
      !sport_type ||
      !capacity ||
      !price_per_hour ||
      !currency ||
      !key_facilities
    ) {
      return res.status(400).json({
        message:
          'Missing required fields: name, location_summary, sport_type, capacity, price_per_hour, currency, key_facilities',
        error: 'Bad Request',
      });
    }

    const newField = dataService.createField(req.body);

    if (!newField) {
      return res.status(500).json({
        message: 'Error creating field',
        error: 'Internal Server Error',
      });
    }

    console.log('✅ ADMIN FIELD CREATED:', {
      adminEmail: req.user.email,
      fieldId: newField.id,
      fieldName: newField.name,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Field created successfully',
      data: newField,
    });
  } catch (error) {
    console.error('❌ ADMIN FIELD CREATE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/fields/{field_id}:
 *   put:
 *     summary: Update a field (Admin)
 *     description: Update an existing sports field
 *     tags: [Admin - Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: field_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The field ID
 *         example: 402
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Field Name"
 *               location_summary:
 *                 type: string
 *                 example: "New Location"
 *               sport_type:
 *                 type: string
 *                 example: "Soccer"
 *               capacity:
 *                 type: integer
 *                 example: 22
 *               price_per_hour:
 *                 type: number
 *                 example: 120000
 *               currency:
 *                 type: string
 *                 example: "Rp"
 *               key_facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Outdoor", "Floodlights", "Parking"]
 *               main_image_url:
 *                 type: string
 *                 example: "https://example.com/images/updated_field.jpg"
 *               availability_summary:
 *                 type: string
 *                 example: "Available tomorrow"
 *     responses:
 *       200:
 *         description: Field updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Field updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       404:
 *         description: Field not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/fields/:field_id', (req, res) => {
  try {
    const { field_id } = req.params;
    const updatedField = dataService.updateField(field_id, req.body);

    if (!updatedField) {
      return res.status(404).json({
        message: 'Field not found',
        error: 'Not Found',
      });
    }

    console.log('✅ ADMIN FIELD UPDATED:', {
      adminEmail: req.user.email,
      fieldId: field_id,
      fieldName: updatedField.name,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Field updated successfully',
      data: updatedField,
    });
  } catch (error) {
    console.error('❌ ADMIN FIELD UPDATE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/fields/{field_id}:
 *   delete:
 *     summary: Delete a field (Admin)
 *     description: Delete an existing sports field
 *     tags: [Admin - Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: field_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The field ID
 *         example: 402
 *     responses:
 *       200:
 *         description: Field deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Field deleted successfully"
 *       404:
 *         description: Field not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete('/fields/:field_id', (req, res) => {
  try {
    const { field_id } = req.params;
    const deleted = dataService.deleteField(field_id);

    if (!deleted) {
      return res.status(404).json({
        message: 'Field not found',
        error: 'Not Found',
      });
    }

    console.log('✅ ADMIN FIELD DELETED:', {
      adminEmail: req.user.email,
      fieldId: field_id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Field deleted successfully',
    });
  } catch (error) {
    console.error('❌ ADMIN FIELD DELETE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

// ============================
// BOOKINGS MANAGEMENT
// ============================

/**
 * @swagger
 * /api/v1/admin/bookings:
 *   get:
 *     summary: Get all bookings (Admin)
 *     description: Get all bookings with admin-level details
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_payment, confirmed, cancelled, completed]
 *         description: Filter by booking status
 *         example: "confirmed"
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bookings retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "BK-20250115-ABC123"
 *                       field_id:
 *                         type: integer
 *                         example: 402
 *                       start_time:
 *                         type: string
 *                         example: "14:00"
 *                       end_time:
 *                         type: string
 *                         example: "16:00"
 *                       date:
 *                         type: string
 *                         example: "2025-01-15"
 *                       status:
 *                         type: string
 *                         example: "confirmed"
 *                       total_price:
 *                         type: number
 *                         example: 190000
 *                       created_at:
 *                         type: string
 *                         example: "2025-01-15T10:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         example: "2025-01-15T10:00:00Z"
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/bookings', (req, res) => {
  try {
    const { status } = req.query;
    let bookings = dataService.getAllBookings();

    // Filter by status if provided
    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
    }

    console.log('✅ ADMIN BOOKINGS LIST:', {
      adminEmail: req.user.email,
      bookingsCount: bookings.length,
      statusFilter: status || 'all',
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('❌ ADMIN BOOKINGS LIST ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/bookings/{booking_id}:
 *   put:
 *     summary: Update a booking (Admin)
 *     description: Update an existing booking status or details
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *         example: "BK-20250115-ABC123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_payment, confirmed, cancelled, completed]
 *                 example: "confirmed"
 *               start_time:
 *                 type: string
 *                 example: "15:00"
 *               end_time:
 *                 type: string
 *                 example: "17:00"
 *               date:
 *                 type: string
 *                 example: "2025-01-16"
 *               notes:
 *                 type: string
 *                 example: "Updated by admin"
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking updated successfully"
 *                 data:
 *                   type: object
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/bookings/:booking_id', (req, res) => {
  try {
    const { booking_id } = req.params;
    const updatedBooking = dataService.updateBooking(booking_id, req.body);

    if (!updatedBooking) {
      return res.status(404).json({
        message: 'Booking not found',
        error: 'Not Found',
      });
    }

    console.log('✅ ADMIN BOOKING UPDATED:', {
      adminEmail: req.user.email,
      bookingId: booking_id,
      newStatus: req.body.status,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('❌ ADMIN BOOKING UPDATE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/bookings/{booking_id}/cancel:
 *   put:
 *     summary: Cancel a booking (Admin)
 *     description: Cancel an existing booking
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking ID
 *         example: "BK-20250115-ABC123"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Facility maintenance required"
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled successfully"
 *                 data:
 *                   type: object
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/bookings/:booking_id/cancel', (req, res) => {
  try {
    const { booking_id } = req.params;
    const { reason } = req.body;

    const cancelledBooking = dataService.cancelBooking(booking_id);

    if (!cancelledBooking) {
      return res.status(404).json({
        message: 'Booking not found',
        error: 'Not Found',
      });
    }

    // Add cancellation reason if provided
    if (reason) {
      const updatedBooking = dataService.updateBooking(booking_id, {
        cancellation_reason: reason,
        cancelled_by: req.user.email,
      });
    }

    console.log('✅ ADMIN BOOKING CANCELLED:', {
      adminEmail: req.user.email,
      bookingId: booking_id,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Booking cancelled successfully',
      data: cancelledBooking,
    });
  } catch (error) {
    console.error('❌ ADMIN BOOKING CANCEL ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

// ============================
// USERS MANAGEMENT
// ============================

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     description: Get all users with pagination and filtering
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, admin]
 *         description: Filter by user role
 *         example: "customer"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                           example: 1
 *                         total_pages:
 *                           type: integer
 *                           example: 5
 *                         total_users:
 *                           type: integer
 *                           example: 50
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search,
    };

    const result = await userService.getAllUsers(options);

    console.log('✅ ADMIN USERS LIST:', {
      adminEmail: req.user.email,
      usersCount: result.users.length,
      totalUsers: result.pagination.total_users,
      page: options.page,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ ADMIN USERS LIST ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{user_id}/role:
 *   put:
 *     summary: Update user role (Admin)
 *     description: Update a user's role
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *         example: "c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - invalid role
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/users/:user_id/role', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be either "customer" or "admin"',
        error: 'Bad Request',
      });
    }

    const updatedUser = await userService.updateUserRole(user_id, role);

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found',
        error: 'Not Found',
      });
    }

    console.log('✅ ADMIN USER ROLE UPDATED:', {
      adminEmail: req.user.email,
      userId: user_id,
      newRole: role,
      userEmail: updatedUser.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'User role updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ ADMIN USER ROLE UPDATE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/{user_id}:
 *   delete:
 *     summary: Delete a user (Admin)
 *     description: Delete a user account
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *         example: "c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Prevent admin from deleting themselves
    if (user_id === req.user.userId) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
        error: 'Bad Request',
      });
    }

    const deleted = await userService.deleteUser(user_id);

    if (!deleted) {
      return res.status(404).json({
        message: 'User not found',
        error: 'Not Found',
      });
    }

    console.log('✅ ADMIN USER DELETED:', {
      adminEmail: req.user.email,
      deletedUserId: user_id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('❌ ADMIN USER DELETE ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/users/statistics:
 *   get:
 *     summary: Get user statistics (Admin)
 *     description: Get user statistics and metrics
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_users:
 *                       type: string
 *                       example: "125"
 *                     customers:
 *                       type: string
 *                       example: "120"
 *                     admins:
 *                       type: string
 *                       example: "5"
 *                     new_users_last_30_days:
 *                       type: string
 *                       example: "15"
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/users/statistics', async (req, res) => {
  try {
    const statistics = await userService.getUserStatistics();

    console.log('✅ ADMIN USER STATISTICS:', {
      adminEmail: req.user.email,
      totalUsers: statistics.total_users,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'User statistics retrieved successfully',
      data: statistics,
    });
  } catch (error) {
    console.error('❌ ADMIN USER STATISTICS ERROR:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
});

module.exports = router;
