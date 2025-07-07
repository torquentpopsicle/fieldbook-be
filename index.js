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

const app = express();
const PORT = process.env.PORT || 8000;

// CORS config: allow frontend and dev URLs
const allowedOrigins = [
  'http://localhost:5173', // Vite dev
  'http://localhost:3000', // React dev
  'https://fieldbook-fe.vercel.app', // Replace with your deployed frontend
];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());

// --- API Routes ---

// Swagger Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fieldbook API Documentation'
}));

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

// Health check
app.get('/', (req, res) => {
  res.send('Fieldbook API is running.');
});
// 404 - Not Found handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 