const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fieldbook API',
      version: '1.0.0',
      description: 'API for managing sports field bookings',
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
            sport_type: { type: 'string', example: 'Futsal' },
            rating: { type: 'number', example: 4.9 },
            main_image_url: {
              type: 'string',
              example: 'https://example.com/images/futsal_jaya.jpg',
            },
            capacity: { type: 'integer', example: 10 },
            availability_summary: {
              type: 'string',
              example: 'Available today',
            },
            price_per_hour: { type: 'number', example: 95000 },
            currency: { type: 'string', example: 'Rp' },
            reviews_count: { type: 'integer', example: 150 },
            key_facilities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Indoor', 'Parking', 'Changing Rooms'],
            },
          },
        },
        FieldDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 101 },
            name: { type: 'string', example: 'Garuda Futsal Center' },
            address: {
              type: 'string',
              example: 'Jl. Pahlawan No. 10, Semarang',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com/images/garuda_futsal_1.jpg'],
            },
            description: {
              type: 'string',
              example: 'Premium indoor futsal facility...',
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              example: ['Toilet', 'Kantin', 'Mushola'],
            },
            availability: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start_time: { type: 'string', example: '09:00' },
                  end_time: { type: 'string', example: '10:00' },
                  is_available: { type: 'boolean', example: true },
                },
              },
            },
            price_per_hour: { type: 'number', example: 95 },
            currency: { type: 'string', example: 'USD' },
            rating: { type: 'number', example: 4.9 },
            reviews_count: { type: 'integer', example: 150 },
            sport_type: { type: 'string', example: 'Futsal' },
            capacity: { type: 'integer', example: 10 },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            field_id: { type: 'integer', example: 101 },
            start_time: { type: 'string', example: '14:00' },
            end_time: { type: 'string', example: '16:00' },
            date: { type: 'string', example: '2025-01-15' },
          },
          required: ['field_id', 'start_time', 'end_time', 'date'],
        },
        BookingResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                booking_id: { type: 'string', example: 'BK-20250115-ABC123' },
                status: { type: 'string', example: 'pending_payment' },
                total_price: { type: 'number', example: 190 },
                payment_due: {
                  type: 'string',
                  example: '2025-01-15T15:00:00Z',
                },
              },
            },
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c',
            },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'customer@example.com' },
            role: { type: 'string', example: 'customer' },
          },
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
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
