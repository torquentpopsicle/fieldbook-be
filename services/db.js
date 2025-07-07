const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fieldbook',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Use connection string if provided
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection
pool.on('connect', () => {
  return;
  // console.log('Connected to PostgreSQL database');
});

pool.on('error', err => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
