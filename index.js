require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Import route handlers
const fieldsRoutes = require('./routes/fields');
const featuredRoutes = require('./routes/featured');
const locationsRoutes = require('./routes/locations');
const bookingsRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS config: allow frontend and dev URLs
const allowedOrigins = [
  'http://localhost:8080', // Frontend dev
  'http://localhost:8000', // Swagger dev
  'http://localhost:5173', // Vite dev
  'https://fieldbook-fe.vercel.app', // Deployed frontend
  'https://fieldbook-fe.vercel.app/', // Deployed frontend with trailing slash
];

// Enhanced CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) {
        console.log('CORS: Allowing request with no origin');
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log('CORS: Allowing origin:', origin);
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.log('CORS: Blocking origin:', origin);
      console.log('CORS: Allowed origins:', allowedOrigins);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  })
);

app.use(helmet());
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Fix double slash issues in URLs
app.use((req, res, next) => {
  // Fix double slashes in URL
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// --- API Routes ---

// Swagger Documentation
app.use(
  '/api/v1/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Fieldbook API Documentation',
  })
);

// Fields routes
app.use('/api/v1/fields', fieldsRoutes);

// Featured fields routes
app.use('/api/v1/featured-fields', featuredRoutes);

// Locations routes
app.use('/api/v1/locations', locationsRoutes);

// Bookings routes
app.use('/api/v1/bookings', bookingsRoutes);

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Profile routes (protected)
app.use('/api/v1/profile', profileRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Fieldbook API is running.');
});

// CORS debug endpoint
app.get('/api/v1/cors-debug', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    requestUrl: req.url,
    fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
    },
  });
});
// 404 - Not Found handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
