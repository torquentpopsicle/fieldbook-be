const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS config: allow frontend and dev URLs
const allowedOrigins = [
  'http://localhost:5173', // Vite dev
  'http://localhost:3000', // React dev
  'https://your-frontend-domain.com', // Replace with your deployed frontend
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

// --- API Endpoints ---

// Search Fields
app.get('/api/v1/fields', (req, res) => {
  // Dummy data for demonstration
  res.json({
    pagination: {
      total_results: 6,
      current_page: 1,
      total_pages: 1,
      limit: 6,
    },
    data: [
      {
        id: 402,
        name: 'Futsal Indoor Semarang Jaya',
        location_summary: 'Tembalang, Semarang',
        sport_type: 'Futsal',
        rating: 4.9,
        main_image_url: 'https://example.com/images/futsal_jaya.jpg',
        capacity: 10,
        availability_summary: 'Available today',
        price_per_hour: 95,
        currency: 'USD',
        reviews_count: 150,
        key_facilities: ['Indoor', 'Parking', 'Changing Rooms'],
      },
      // ... more dummy fields
    ],
  });
});

// Field Detail
app.get('/api/v1/fields/:field_id', (req, res) => {
  res.json({
    data: {
      id: 101,
      name: 'Garuda Futsal Center',
      address: 'Jl. Pahlawan No. 10, Semarang',
      images: [],
      description: '...',
      facilities: ['Toilet', 'Kantin', 'Mushola'],
      availability: [
        { start_time: '09:00', end_time: '10:00', is_available: true },
        { start_time: '10:00', end_time: '11:00', is_available: false },
        { start_time: '11:00', end_time: '12:00', is_available: true },
      ],
    },
  });
});

// Filter Options
app.get('/api/v1/fields/filters', (req, res) => {
  res.json({
    data: {
      price_range: { min: 0, max: 500 },
      features: [
        { id: 'indoor', name: 'Indoor' },
        { id: 'outdoor', name: 'Outdoor' },
        { id: 'parking', name: 'Parking' },
        { id: 'changing_rooms', name: 'Changing Rooms' },
        { id: 'equipment_rental', name: 'Equipment Rental' },
        { id: 'floodlights', name: 'Floodlights' },
        { id: 'air_conditioning', name: 'Air Conditioning' },
      ],
      sport_types: [
        { id: 1, name: 'Soccer' },
        { id: 2, name: 'Basketball' },
        { id: 3, name: 'Futsal' },
        { id: 4, name: 'Badminton' },
      ],
    },
  });
});

// Featured Fields
app.get('/api/v1/featured-fields', (req, res) => {
  res.json({
    data: [
      {
        id: 215,
        name: 'Elite Soccer Complex',
        location_summary: 'Downtown Sports Center',
        sport_type: 'Soccer',
        rating: 4.8,
        main_image_url: 'https://example.com/images/elite_soccer.jpg',
        capacity: 22,
        availability_summary: 'Available today',
        price_per_hour: 75,
        currency: 'USD',
        reviews_count: 124,
        key_facilities: ['Floodlights', 'Parking', 'Changing Rooms'],
      },
      {
        id: 301,
        name: 'Premium Basketball Court',
        location_summary: 'City Sports Hub',
        sport_type: 'Basketball',
        rating: 4.9,
        main_image_url: 'https://example.com/images/premium_basketball.jpg',
        capacity: 10,
        availability_summary: 'Available now',
        price_per_hour: 45,
        currency: 'USD',
        reviews_count: 89,
        key_facilities: ['Indoor', 'Air Conditioning', 'Sound System'],
      },
      // ... more fields
    ],
  });
});

// Location Autocomplete
app.get('/api/v1/locations/autocomplete', (req, res) => {
  res.json({
    data: [
      { name: 'Semarang', id: 'kota-smg' },
      { name: 'Semarang Barat', id: 'kec-smg-brt' },
      { name: 'Semarang Selatan', id: 'kec-smg-slt' },
    ],
  });
});

// Booking (dummy, no real auth)
app.post('/api/v1/bookings', (req, res) => {
  res.status(201).json({
    data: {
      booking_id: 'BK-20250725-XYZ',
      status: 'pending_payment',
      total_price: 150000,
      payment_due: '2025-07-25T10:30:00Z',
    },
  });
});

// Auth: Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'customer@example.com' && password === 'customer123') {
    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: 'c7a8f5e2-4b1d-4c9f-8a2b-1d9e0f6a3b1c',
          name: 'John Doe',
          email: 'customer@example.com',
          role: 'customer',
        },
        access_token: 'dummy.jwt.token',
      },
    });
  } else {
    res.status(401).json({
      message: 'Email atau password yang Anda masukkan salah.',
      error: 'Unauthorized',
    });
  }
});

// Auth: Register
app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required.' });
  }
  if (email === 'jane.doe@example.com') {
    return res.status(409).json({
      message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      error: 'Conflict',
    });
  }
  res.status(201).json({
    message: 'User registered successfully',
    data: {
      id: 'd8b9g6f3-5c2e-5d0g-9b3c-2e0f1g7b4c2d',
      name,
      email,
      role: 'customer',
    },
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('Fieldbook API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 