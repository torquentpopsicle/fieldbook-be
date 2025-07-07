const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fieldbook API',
      version: '2.0.0',
      description:
        'API for managing sports field bookings with PostgreSQL database',
      contact: {
        name: 'Fieldbook Team',
        email: 'support@fieldbook.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://fieldbook-be.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Field: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 402 },
            name: { type: 'string', example: 'Futsal Indoor Semarang Jaya' },
            location_summary: {
              type: 'string',
              example: 'Tembalang, Semarang',
            },
            address: {
              type: 'string',
              example: 'Jl. Pahlawan No. 10, Semarang',
            },
            sport_type: { type: 'string', example: 'Futsal' },
            sport_type_id: { type: 'integer', example: 1 },
            rating: { type: 'number', example: 4.9 },
            reviews_count: { type: 'integer', example: 150 },
            main_image_url: {
              type: 'string',
              example: 'https://example.com/images/futsal_jaya.jpg',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'https://example.com/images/futsal_jaya_1.jpg',
                'https://example.com/images/futsal_jaya_2.jpg',
              ],
            },
            capacity: { type: 'integer', example: 10 },
            availability_summary: {
              type: 'string',
              example: 'Available today',
            },
            price_per_hour: { type: 'number', example: 95000 },
            currency: { type: 'string', example: 'Rp' },
            description: {
              type: 'string',
              example: 'Premium indoor futsal facility with modern amenities',
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Indoor', 'Parking', 'Changing Rooms'],
            },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        FieldCreate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Futsal Indoor Semarang Jaya' },
            location_summary: {
              type: 'string',
              example: 'Tembalang, Semarang',
            },
            address: {
              type: 'string',
              example: 'Jl. Pahlawan No. 10, Semarang',
            },
            sport_type: { type: 'string', example: 'Futsal' },
            rating: { type: 'number', example: 4.9 },
            reviews_count: { type: 'integer', example: 150 },
            main_image_url: {
              type: 'string',
              example: 'https://example.com/images/futsal_jaya.jpg',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'https://example.com/images/futsal_jaya_1.jpg',
                'https://example.com/images/futsal_jaya_2.jpg',
              ],
            },
            capacity: { type: 'integer', example: 10 },
            availability_summary: {
              type: 'string',
              example: 'Available today',
            },
            price_per_hour: { type: 'number', example: 95000 },
            currency: { type: 'string', example: 'Rp' },
            description: {
              type: 'string',
              example: 'Premium indoor futsal facility with modern amenities',
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Indoor', 'Parking', 'Changing Rooms'],
            },
          },
          required: [
            'name',
            'location_summary',
            'address',
            'sport_type',
            'price_per_hour',
          ],
        },
        FieldUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Futsal Indoor Semarang Jaya' },
            location_summary: {
              type: 'string',
              example: 'Tembalang, Semarang',
            },
            address: {
              type: 'string',
              example: 'Jl. Pahlawan No. 10, Semarang',
            },
            sport_type: { type: 'string', example: 'Futsal' },
            rating: { type: 'number', example: 4.9 },
            reviews_count: { type: 'integer', example: 150 },
            main_image_url: {
              type: 'string',
              example: 'https://example.com/images/futsal_jaya.jpg',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'https://example.com/images/futsal_jaya_1.jpg',
                'https://example.com/images/futsal_jaya_2.jpg',
              ],
            },
            capacity: { type: 'integer', example: 10 },
            availability_summary: {
              type: 'string',
              example: 'Available today',
            },
            price_per_hour: { type: 'number', example: 95000 },
            currency: { type: 'string', example: 'Rp' },
            description: {
              type: 'string',
              example: 'Premium indoor futsal facility with modern amenities',
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Indoor', 'Parking', 'Changing Rooms'],
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            field_id: { type: 'integer', example: 101 },
            user_id: {
              type: 'string',
              example: 'c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c',
            },
            booking_date: {
              type: 'string',
              format: 'date',
              example: '2025-01-15',
            },
            start_time: { type: 'string', example: '14:00' },
            end_time: { type: 'string', example: '16:00' },
            total_hours: { type: 'number', example: 2 },
            total_price: { type: 'number', example: 190000 },
            status: {
              type: 'string',
              example: 'confirmed',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            },
            payment_status: {
              type: 'string',
              example: 'paid',
              enum: ['pending', 'paid', 'failed'],
            },
            booking_code: { type: 'string', example: 'BK-20250115-ABC123' },
            notes: {
              type: 'string',
              example: 'Please prepare the field 15 minutes before',
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        BookingCreate: {
          type: 'object',
          properties: {
            field_id: { type: 'integer', example: 101 },
            booking_date: {
              type: 'string',
              format: 'date',
              example: '2025-01-15',
            },
            start_time: { type: 'string', example: '14:00' },
            end_time: { type: 'string', example: '16:00' },
            notes: {
              type: 'string',
              example: 'Please prepare the field 15 minutes before',
            },
          },
          required: ['field_id', 'booking_date', 'start_time', 'end_time'],
        },
        BookingUpdate: {
          type: 'object',
          properties: {
            booking_date: {
              type: 'string',
              format: 'date',
              example: '2025-01-15',
            },
            start_time: { type: 'string', example: '14:00' },
            end_time: { type: 'string', example: '16:00' },
            status: {
              type: 'string',
              example: 'confirmed',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            },
            payment_status: {
              type: 'string',
              example: 'paid',
              enum: ['pending', 'paid', 'failed'],
            },
            notes: {
              type: 'string',
              example: 'Please prepare the field 15 minutes before',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c',
            },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'customer@example.com' },
            role: {
              type: 'string',
              example: 'customer',
              enum: ['customer', 'admin'],
            },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        UserUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'customer@example.com' },
            role: {
              type: 'string',
              example: 'customer',
              enum: ['customer', 'admin'],
            },
            is_active: { type: 'boolean', example: true },
          },
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', example: 'customer@example.com' },
            password: { type: 'string', example: 'customer123' },
          },
          required: ['email', 'password'],
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'password123' },
          },
          required: ['name', 'email', 'password'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                access_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                token_type: { type: 'string', example: 'Bearer' },
                expires_in: { type: 'string', example: '24h' },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Field' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 50 },
                total_pages: { type: 'integer', example: 5 },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Bad Request' },
            statusCode: { type: 'integer', example: 400 },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
